"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AIProvider {
  name: string;
  models: Array<{
    id: string;
    name: string;
    description: string;
    free: boolean;
  }>;
}

interface SettingsPanelProps {
  selectedProvider: string;
  selectedModel: string;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  onSaveSettings: () => void;
}

// Data for AI providers and their models
const aiProviders: AIProvider[] = [
  {
    name: "Google",
    models: [
      { 
        id: "gemini-flash", 
        name: "Gemini Flash", 
        description: "Fast responses for everyday tasks",
        free: true
      },
      { 
        id: "gemini-pro", 
        name: "Gemini Pro", 
        description: "Enhanced reasoning and instruction following",
        free: false
      },
      { 
        id: "gemini-ultra", 
        name: "Gemini Ultra", 
        description: "Google's most capable model for highly complex tasks",
        free: false
      },
    ]
  },
  {
    name: "OpenAI",
    models: [
      { 
        id: "gpt-3.5-turbo", 
        name: "GPT-3.5 Turbo", 
        description: "Good balance of capability and speed",
        free: false
      },
      { 
        id: "gpt-4o", 
        name: "GPT-4o", 
        description: "OpenAI's latest model with advanced reasoning",
        free: false
      },
      { 
        id: "gpt-4o-mini", 
        name: "GPT-4o Mini", 
        description: "Smaller, faster version of GPT-4o",
        free: false
      },
    ]
  },
  {
    name: "Anthropic",
    models: [
      { 
        id: "claude-3-haiku", 
        name: "Claude 3 Haiku", 
        description: "Fast responses and cost-effective",
        free: false
      },
      { 
        id: "claude-3-sonnet", 
        name: "Claude 3 Sonnet", 
        description: "Balanced performance and intelligence",
        free: false
      },
      { 
        id: "claude-3-opus", 
        name: "Claude 3 Opus", 
        description: "Anthropic's most powerful model",
        free: false
      },
    ]
  },
  {
    name: "Meta",
    models: [
      { 
        id: "llama-3-8b", 
        name: "Llama 3 8B", 
        description: "Compact, efficient performance",
        free: false
      },
      { 
        id: "llama-3-70b", 
        name: "Llama 3 70B", 
        description: "Meta's most capable open model",
        free: false
      },
      { 
        id: "llama-3.1-405b", 
        name: "Llama 3.1 405B", 
        description: "Meta's largest and most advanced model",
        free: false
      },
    ]
  },
  {
    name: "Deepseek",
    models: [
      { 
        id: "deepseek-coder", 
        name: "Deepseek Coder", 
        description: "Specialized for code generation and understanding",
        free: false
      },
      { 
        id: "deepseek-67b", 
        name: "Deepseek 67B", 
        description: "General purpose large language model",
        free: false
      },
    ]
  }
];

export default function SettingsPanel({
  selectedProvider = "Google",
  selectedModel = "gemini-flash",
  onProviderChange,
  onModelChange,
  apiKey = "",
  onApiKeyChange,
  onSaveSettings,
}: SettingsPanelProps) {
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(apiKey);
  
  // Find the current provider
  const currentProvider = aiProviders.find(p => p.name === selectedProvider) || aiProviders[0];
  
  // Find the current model
  const currentModel = currentProvider.models.find(m => m.id === selectedModel) || currentProvider.models[0];

  // Handle provider selection
  const handleProviderSelect = (providerName: string) => {
    onProviderChange(providerName);
    setIsProviderDropdownOpen(false);
    
    // When changing provider, select the first model by default
    const provider = aiProviders.find(p => p.name === providerName);
    if (provider) {
      onModelChange(provider.models[0].id);
    }
  };

  // Handle model selection
  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsModelDropdownOpen(false);
  };
  
  // Handle API key change
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKeyInput(e.target.value);
  };
  
  // Handle save button click
  const handleSave = () => {
    onApiKeyChange(apiKeyInput);
    onSaveSettings();
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full bg-gray-200/30 dark:bg-gray-800/30 rounded-md p-4 border border-gray-300/50 dark:border-gray-700/50">
      <div className="text-sm font-medium mb-1 w-full">
        Configure AI Model Settings
      </div>
      
      {/* Provider Dropdown */}
      <div className="w-full">
        <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">
          AI Provider
        </label>
        <div className="relative">
          <button
            onClick={() => setIsProviderDropdownOpen(!isProviderDropdownOpen)}
            className="w-full flex items-center justify-between bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 text-sm"
          >
            <span>{selectedProvider}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          
          {isProviderDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
              {aiProviders.map((provider) => (
                <div
                  key={provider.name}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    provider.name === selectedProvider ? 'bg-gray-100 dark:bg-gray-800 font-medium' : ''
                  }`}
                  onClick={() => handleProviderSelect(provider.name)}
                >
                  {provider.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Model Dropdown */}
      <div className="w-full">
        <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">
          AI Model
        </label>
        <div className="relative">
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="w-full flex items-center justify-between bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 text-sm"
          >
            <div className="flex items-center">
              <span>{currentModel.name}</span>
              {currentModel.free && (
                <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                  Free
                </span>
              )}
            </div>
            <ChevronDown className="h-4 w-4" />
          </button>
          
          {isModelDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
              {currentProvider.models.map((model) => (
                <div
                  key={model.id}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    model.id === selectedModel ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                  onClick={() => handleModelSelect(model.id)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{model.name}</span>
                    {model.free && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                        Free
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {model.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          {currentModel.description}
        </p>
      </div>
      
      {/* API Key */}
      <div className="w-full mt-2">
        <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">
          API Key {!currentModel.free && <span className="text-red-500">*</span>}
        </label>
        <input
          type="password"
          value={apiKeyInput}
          onChange={handleApiKeyChange}
          className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 text-sm"
          placeholder={`Enter your ${selectedProvider} API key`}
          required={!currentModel.free}
        />
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          {currentModel.free 
            ? "No API key required for this free model" 
            : `API key required for ${currentModel.name}`}
        </p>
      </div>
      
      {/* Save Button */}
      <button
        onClick={handleSave}
        className="mt-2 bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 py-2 px-4 rounded-md text-white w-full
          transition-colors duration-200 font-medium"
      >
        Save Settings
      </button>
      
      {/* Info Text */}
      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 text-center">
        {currentModel.free 
          ? "Using a free model. No API key or account required."
          : "Your API key is stored locally and never sent to our servers."}
      </div>
    </div>
  );
}