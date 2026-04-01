const OpenAI = require('openai');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIService {
  /**
   * Extract text from uploaded file (PDF or DOCX)
   */
  async extractTextFromFile(filePath, fileType) {
    try {
      const fileBuffer = await fs.readFile(filePath);
      
      if (fileType === 'pdf') {
        const data = await pdf(fileBuffer);
        return data.text;
      } else if (fileType === 'docx') {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        return result.value;
      } else {
        throw new Error('Unsupported file type');
      }
    } catch (error) {
      console.error('Error extracting text from file:', error);
      throw new Error('Failed to extract text from file');
    }
  }

  /**
   * Analyze policy document using OpenAI
   */
  async analyzePolicy(text, policyType) {
    try {
      const prompt = `
Analyze the following insurance policy document and extract key information. 
Policy Type: ${policyType}

Please provide a structured analysis in JSON format with the following fields:
{
  "summary": "Brief summary of the policy (2-3 sentences)",
  "coverage": ["List of main coverage items"],
  "risks": ["List of identified risks"],
  "clauses": [
    {
      "title": "Clause title",
      "content": "Brief description",
      "importance": "low|medium|high|critical"
    }
  ],
  "exclusions": ["List of main exclusions"],
  "conditions": ["List of important conditions"],
  "extractedEntities": {
    "persons": ["Names mentioned"],
    "organizations": ["Companies/organizations mentioned"],
    "dates": ["Important dates"],
    "amounts": ["Monetary amounts mentioned"]
  },
  "riskScore": 0-100,
  "complianceScore": 0-100
}

Policy Document:
${text}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert insurance policy analyst. Analyze policies and provide structured JSON responses. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const result = response.choices[0].message.content;
      
      // Parse the JSON response
      try {
        return JSON.parse(result);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Return a basic analysis if JSON parsing fails
        return {
          summary: "AI analysis completed but parsing failed",
          coverage: [],
          risks: [],
          clauses: [],
          exclusions: [],
          conditions: [],
          extractedEntities: { persons: [], organizations: [], dates: [], amounts: [] },
          riskScore: 50,
          complianceScore: 50
        };
      }
    } catch (error) {
      console.error('Error analyzing policy:', error);
      throw new Error('Failed to analyze policy with AI');
    }
  }

  /**
   * Generate embeddings for text chunks
   */
  async generateEmbeddings(textChunks) {
    try {
      const embeddings = [];
      
      for (const chunk of textChunks) {
        const response = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: chunk
        });
        
        embeddings.push({
          content: chunk,
          embedding: response.data[0].embedding,
          metadata: {
            type: 'policy_chunk',
            chunkIndex: textChunks.indexOf(chunk)
          }
        });
      }
      
      return embeddings;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  /**
   * Split text into chunks for embedding
   */
  splitTextIntoChunks(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      const chunk = text.substring(i, i + chunkSize);
      if (chunk.trim().length > 0) {
        chunks.push(chunk.trim());
      }
    }
    
    return chunks;
  }

  /**
   * Search for relevant chunks using cosine similarity
   */
  async searchRelevantChunks(query, embeddings, topK = 5) {
    try {
      // Generate embedding for the query
      const queryResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: query
      });
      
      const queryEmbedding = queryResponse.data[0].embedding;
      
      // Calculate cosine similarity
      const similarities = embeddings.map(embedding => {
        const similarity = this.cosineSimilarity(queryEmbedding, embedding.embedding);
        return {
          ...embedding,
          similarity
        };
      });
      
      // Sort by similarity and return top K
      similarities.sort((a, b) => b.similarity - a.similarity);
      
      return similarities.slice(0, topK);
    } catch (error) {
      console.error('Error searching relevant chunks:', error);
      throw new Error('Failed to search relevant chunks');
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (normA * normB);
  }

  /**
   * Generate response using RAG (Retrieval-Augmented Generation)
   */
  async generateRAGResponse(query, relevantChunks) {
    try {
      // Build context from relevant chunks
      const context = relevantChunks
        .map((chunk, index) => `[Source ${index + 1}]: ${chunk.content}`)
        .join('\n\n');

      const prompt = `
Based on the following context from insurance policy documents, answer the user's question. 
If the answer is not found in the context, say "I don't have enough information to answer that question based on the provided policies."

Context:
${context}

User Question: ${query}

Provide a helpful and accurate answer based on the context. If you use information from a specific source, mention it in your response.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful insurance policy assistant. Answer questions based only on the provided context from policy documents."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      return {
        answer: response.choices[0].message.content,
        sources: relevantChunks.map((chunk, index) => ({
          sourceId: index + 1,
          content: chunk.content.substring(0, 200) + '...',
          similarity: chunk.similarity
        }))
      };
    } catch (error) {
      console.error('Error generating RAG response:', error);
      throw new Error('Failed to generate response');
    }
  }

  /**
   * Compare two policies
   */
  async comparePolicies(policy1, policy2) {
    try {
      const prompt = `
Compare the following two insurance policies and highlight the key differences:

Policy 1:
Title: ${policy1.title}
Type: ${policy1.policyType}
Coverage: ${policy1.aiAnalysis.coverage.join(', ')}
Premium: ${policy1.premium}
Risk Score: ${policy1.aiAnalysis.riskScore}

Policy 2:
Title: ${policy2.title}
Type: ${policy2.policyType}
Coverage: ${policy2.aiAnalysis.coverage.join(', ')}
Premium: ${policy2.premium}
Risk Score: ${policy2.aiAnalysis.riskScore}

Provide a comparison in JSON format:
{
  "coverageComparison": {
    "policy1Only": ["Coverage items only in Policy 1"],
    "policy2Only": ["Coverage items only in Policy 2"],
    "common": ["Coverage items in both policies"]
  },
  "premiumComparison": "Description of premium differences",
  "riskComparison": "Analysis of risk differences",
  "recommendation": "Which policy might be better and why"
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an insurance comparison expert. Provide structured JSON comparisons."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      });

      const result = response.choices[0].message.content;
      
      try {
        return JSON.parse(result);
      } catch (parseError) {
        console.error('Error parsing comparison response:', parseError);
        return {
          coverageComparison: { policy1Only: [], policy2Only: [], common: [] },
          premiumComparison: "Comparison analysis completed",
          riskComparison: "Risk analysis completed",
          recommendation: "Please review manually"
        };
      }
    } catch (error) {
      console.error('Error comparing policies:', error);
      throw new Error('Failed to compare policies');
    }
  }
}

module.exports = new AIService();
