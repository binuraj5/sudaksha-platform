import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI/ML & Gen AI Courses - Sudaksha | Artificial Intelligence & Machine Learning Training',
  description: 'Learn artificial intelligence, machine learning, deep learning, and generative AI technologies including ChatGPT and large language models.',
  keywords: 'artificial intelligence, machine learning, deep learning, generative AI, ChatGPT, LLM, neural networks',
};

export default function AIMLPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI/ML & Gen AI
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Dive into the world of artificial intelligence and machine learning with cutting-edge courses covering traditional ML to generative AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Machine Learning Fundamentals</h3>
            <p className="text-gray-600 mb-4">Learn core ML concepts, algorithms, and practical implementation.</p>
            <div className="text-blue-600 font-semibold">Duration: 3 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Deep Learning & Neural Networks</h3>
            <p className="text-gray-600 mb-4">Master deep learning architectures and neural network implementations.</p>
            <div className="text-blue-600 font-semibold">Duration: 4 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Generative AI Development</h3>
            <p className="text-gray-600 mb-4">Build applications with GPT models and other generative AI technologies.</p>
            <div className="text-blue-600 font-semibold">Duration: 3 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Computer Vision</h3>
            <p className="text-gray-600 mb-4">Learn image processing, object detection, and computer vision applications.</p>
            <div className="text-blue-600 font-semibold">Duration: 4 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Natural Language Processing</h3>
            <p className="text-gray-600 mb-4">Master NLP techniques, sentiment analysis, and language understanding.</p>
            <div className="text-blue-600 font-semibold">Duration: 3 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Engineering & MLOps</h3>
            <p className="text-gray-600 mb-4">Deploy and maintain ML models in production environments.</p>
            <div className="text-blue-600 font-semibold">Duration: 5 months</div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="/demo" className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
            Book a Free Demo
          </a>
        </div>
      </div>
    </div>
  );
}
