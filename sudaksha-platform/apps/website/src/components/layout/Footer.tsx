import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-blue-950 text-white">
      <div className="px-4 py-12 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* For Corporates */}
          <div>
            <h4 className="text-lg font-semibold mb-4">For Corporates</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/corporate-training" className="text-gray-400 hover:text-white">
                  Corporate Training
                </Link>
              </li>
              <li>
                <Link href="/skill-assessment" className="text-gray-400 hover:text-white">
                  Skill Assessment
                </Link>
              </li>
              <li>
                <Link href="/custom-programs" className="text-gray-400 hover:text-white">
                  Custom Programs
                </Link>
              </li>
              <li>
                <Link href="/enterprise-solutions" className="text-gray-400 hover:text-white">
                  Enterprise Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* For Individuals */}
          <div>
            <h4 className="text-lg font-semibold mb-4">For Individuals</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/courses" className="text-gray-400 hover:text-white">
                  All Courses
                </Link>
              </li>
              <li>
                <Link href="/career-paths" className="text-gray-400 hover:text-white">
                  Career Paths
                </Link>
              </li>
              <li>
                <Link href="/certification" className="text-gray-400 hover:text-white">
                  Certification
                </Link>
              </li>
              <li>
                <Link href="/placement-support" className="text-gray-400 hover:text-white">
                  Placement Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/why-sudaksha" className="text-gray-400 hover:text-white">
                  Why Sudaksha
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="text-gray-400 hover:text-white">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-white">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-gray-400 hover:text-white">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/webinars" className="text-gray-400 hover:text-white">
                  Webinars
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Phone: +91 91210 44435</li>
              <li>Email: info@sudaksha.com</li>
              <li>Address: 3rd Floor, Plot No. 705, Road No.36, Jubilee Hills, Hyderabad, Telangana 500033</li>
            </ul>

            {/* Social Media Links */}
            <div className="mt-6">
              <h5 className="text-sm font-semibold mb-3">Follow Us</h5>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center px-4 max-w-screen-xl mx-auto">
            <p className="text-gray-400 text-sm">
              &copy; 2024 Sudaksha. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-gray-400 hover:text-white text-sm">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="text-gray-400 hover:text-white text-sm">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
