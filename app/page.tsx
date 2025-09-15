export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">🎹 UniPiano Learning App</h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Master piano skills with interactive lessons, real-time audio analysis, and personalized progress tracking
          designed for learners of all ages.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-4">🎵</div>
            <h3 className="text-lg font-semibold mb-2">Interactive Lessons</h3>
            <p className="text-gray-600">Step-by-step piano lessons with visual guides and practice exercises</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-4">🎤</div>
            <h3 className="text-lg font-semibold mb-2">Audio Analysis</h3>
            <p className="text-gray-600">Real-time feedback on your playing with advanced audio processing</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Progress Tracking</h3>
            <p className="text-gray-600">Monitor your improvement with detailed analytics and achievements</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-md mb-8">
          <h3 className="text-2xl font-semibold mb-6 text-gray-900">🎹 Piano Practice</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="/piano-lesson"
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg p-6 hover:from-purple-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
            >
              <div className="text-2xl mb-2">🎼</div>
              <h4 className="font-semibold mb-2">Piano Lesson</h4>
              <p className="text-sm opacity-90">Learn "Twinkle Twinkle Little Star" with real-time feedback</p>
            </a>

            <a
              href="/piano-test"
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg p-6 hover:from-green-600 hover:to-teal-600 transition-all duration-200 transform hover:scale-105"
            >
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-semibold mb-2">Note Recognition Test</h4>
              <p className="text-sm opacity-90">Test your skills with full 5-octave piano recognition</p>
            </a>

            <a
              href="/note-recognition"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-6 hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
            >
              <div className="text-2xl mb-2">🎵</div>
              <h4 className="font-semibold mb-2">Free Practice</h4>
              <p className="text-sm opacity-90">Practice any notes with monophonic recognition</p>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-4">API Status</h3>
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Backend API</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Database Connected</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Backend running on localhost:8000 •
            <a href="http://localhost:8000/docs" className="text-blue-600 hover:underline ml-1">
              View API Documentation
            </a>
          </p>
        </div>

        <div className="text-sm text-gray-500">
          <p>Built with FastAPI, React Native, and Supabase</p>
        </div>
      </div>
    </div>
  )
}
