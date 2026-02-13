export const metadata = {
    title: 'Terms of Service | Sudaksha',
    description: 'Terms and conditions for using Sudaksha training services.',
};

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                        <p className="text-blue-100">Last updated: January 2024</p>
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
                        <div className="prose prose-lg max-w-none">
                            <h2>1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using Sudaksha's services, you agree to be bound by these Terms of Service
                                and all applicable laws and regulations. If you do not agree with any of these terms, you
                                are prohibited from using our services.
                            </p>

                            <h2>2. Services Provided</h2>
                            <p>
                                Sudaksha provides skill development training programs, courses, and placement support
                                services. We reserve the right to modify, suspend, or discontinue any service at any time
                                without notice.
                            </p>

                            <h2>3. Registration and Account</h2>
                            <ul>
                                <li>You must provide accurate and complete information during registration</li>
                                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                                <li>You must be at least 16 years old to create an account</li>
                                <li>One person may not maintain multiple accounts</li>
                            </ul>

                            <h2>4. Course Enrollment and Payment</h2>
                            <ul>
                                <li>Course fees must be paid in full or according to agreed payment plans</li>
                                <li>Enrollment is confirmed upon receipt of payment</li>
                                <li>Late payments may result in suspension of access to course materials</li>
                                <li>All fees are in the currency specified at the time of purchase</li>
                            </ul>

                            <h2>5. Refund Policy</h2>
                            <ul>
                                <li>Refunds are available within 7 days of course commencement</li>
                                <li>Refund requests must be submitted in writing</li>
                                <li>Refunds will be processed within 14 business days</li>
                                <li>No refunds after 7 days from course start date</li>
                            </ul>

                            <h2>6. Intellectual Property</h2>
                            <p>
                                All course materials, content, and resources provided by Sudaksha are protected by
                                copyright and other intellectual property rights. You may not copy, distribute, or
                                reproduce any materials without express written permission.
                            </p>

                            <h2>7. Student Conduct</h2>
                            <p>Students are expected to:</p>
                            <ul>
                                <li>Respect instructors, staff, and fellow students</li>
                                <li>Attend classes and complete assignments on time</li>
                                <li>Not engage in plagiarism or academic dishonesty</li>
                                <li>Not share login credentials or course materials</li>
                            </ul>

                            <h2>8. Placement Assistance</h2>
                            <p>
                                While we provide comprehensive placement support, we do not guarantee job placement.
                                Placement success depends on various factors including market conditions, individual
                                skills, and performance.
                            </p>

                            <h2>9. Limitation of Liability</h2>
                            <p>
                                Sudaksha shall not be liable for any indirect, incidental, special, or consequential
                                damages arising out of or in connection with our services.
                            </p>

                            <h2>10. Termination</h2>
                            <p>
                                We reserve the right to terminate or suspend access to our services immediately,
                                without prior notice, for conduct that we believe violates these Terms of Service.
                            </p>

                            <h2>11. Governing Law</h2>
                            <p>
                                These Terms shall be governed by and construed in accordance with the laws of India,
                                without regard to its conflict of law provisions.
                            </p>

                            <h2>12. Changes to Terms</h2>
                            <p>
                                We reserve the right to modify these terms at any time. We will notify users of any
                                material changes. Continued use of our services after changes constitutes acceptance
                                of the updated terms.
                            </p>

                            <h2>13. Contact Information</h2>
                            <p>
                                For questions about these Terms of Service, contact us at:
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
