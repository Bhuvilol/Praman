function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-12 sm:px-16 lg:px-20 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <img 
              src="/logod.png" 
              alt="PRAMAN" 
              className="h-12 w-auto mb-4"
            />
            <p className="text-gray-700 font-medium max-w-md">
              Connecting contributors and consumers in a decentralized ecosystem 
              built on trust and transparency.
            </p>
          </div>
          
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-4">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">
                  How it Works
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">
                  For Contributors
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">
                  For Consumers
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600">
            © 2024 PRAMAN. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
