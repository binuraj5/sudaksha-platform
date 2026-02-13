export default function TestPage() {
    return (
        <div className="p-20">
            <h1 className="text-4xl font-bold">Test Page</h1>
            <p className="mt-4">If you can see this and click it, the layout might be fine.</p>
            <button
                onClick={() => alert('Clicked!')}
                className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
                Click Me
            </button>
        </div>
    );
}
