export const metadata = {
    title: 'Privacy Policy | Sudaksha',
    description: 'Learn how Sudaksha collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                        <p className="text-blue-100">Last updated: January 2024</p>
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
                        <div className="prose prose-lg max-w-none">
                            <h2>1. Information We Collect</h2>
                            <p>
                                We collect information that you provide directly to us when you register for courses,
                                create an account, subscribe to our newsletter, or contact us. This may include:
                            </p>
                            <ul>
                                <li>Name, email address, and contact information</li>
                                <li>Educational and professional background</li>
                                <li>Payment and billing information</li>
                                <li>Course enrollment and progress data</li>
                                <li>Communication preferences</li>
                            </ul>

                            <h2>2. How We Use Your Information</h2>
                            <p>We use the information we collect to:</p>
                            <ul>
                                <li>Provide, maintain, and improve our training services</li>
                                <li>Process your enrollments and payments</li>
                                <li>Send you course materials, updates, and administrative information</li>
                                <li>Respond to your comments, questions, and requests</li>
                                <li>Provide career support and placement assistance</li>
                                <li>Analyze usage patterns to improve our platform</li>
                            </ul>

                            <h2>3. Information Sharing and Disclosure</h2>
                            <p>
                                We do not sell your personal information. We may share your information with:
                            </p>
                            <ul>
                                <li>Service providers who assist in delivering our services</li>
                                <li>Corporate partners for placement opportunities (with your consent)</li>
                                <li>Legal authorities when required by law</li>
                            </ul>

                            <h2>4. Data Security</h2>
                            <p>
                                We implement appropriate technical and organizational measures to protect your
                                personal information against unauthorized access, alteration, disclosure, or destruction.
                            </p>

                            <h2>5. Your Rights</h2>
                            <p>You have the right to:</p>
                            <ul>
                                <li>Access and update your personal information</li>
                                <li>Request deletion of your data</li>
                                <li>Opt-out of marketing communications</li>
                                <li>Request a copy of your data</li>
                            </ul>

                            <h2>6. Cookies and Tracking</h2>
                            <p>
                                We use cookies and similar tracking technologies to improve your experience,
                                analyze usage patterns, and deliver personalized content.
                            </p>

                            <h2>7. Children's Privacy</h2>
                            <p>
                                Our services are not directed to individuals under 16. We do not knowingly collect
                                personal information from children under 16.
                            </p>

                            <h2>8. Changes to This Policy</h2>
                            <p>
                                We may update this privacy policy from time to time. We will notify you of any
                                material changes by posting the new policy on this page and updating the "Last updated" date.
                            </p>

                            <h2>9. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at:
                                <br />
                                Email: info@sudaksha.com
                                <br />
                                Phone: +91 91210 44435
                                <br />
                                Address: 3rd Floor, Plot No. 705, Road No.36, Jubilee Hills, Hyderabad, Telangana 500033
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
