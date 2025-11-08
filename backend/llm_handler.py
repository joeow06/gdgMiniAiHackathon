from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import torch
import os

class LocalLLM:
    def __init__(self, model_name="microsoft/DialoGPT-medium"):
        self.model_name = model_name
        self.tokenizer = None
        self.model = None
        self.pipeline = None
        self.load_model()
    
    def load_model(self):
        """Load the local LLM"""
        try:
            # Using a smaller model for local execution
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForCausalLM.from_pretrained(self.model_name)
            
            # Create text generation pipeline
            self.pipeline = pipeline(
                "text-generation",
                model=self.model,
                tokenizer=self.tokenizer,
                torch_dtype=torch.float16,
                device_map="auto",
            )
            
            print(f"Model {self.model_name} loaded successfully")
            
        except Exception as e:
            print(f"Error loading model: {e}")
            # Fallback to a very simple response generator
            self.pipeline = None
    
    def generate_response(self, prompt, context="", max_length=150):
        """Generate response using local LLM"""
        try:
            if self.pipeline is None:
                return "I'm running in fallback mode. Please check if the LLM model is properly installed."
            
            # Enhance prompt with context
            enhanced_prompt = f"Context: {context}\n\nQuestion: {prompt}\n\nAnswer:"
            
            response = self.pipeline(
                enhanced_prompt,
                max_length=max_length,
                num_return_sequences=1,
                temperature=0.7,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
            
            return response[0]['generated_text'].replace(enhanced_prompt, "").strip()
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return "I apologize, but I encountered an error processing your request."
