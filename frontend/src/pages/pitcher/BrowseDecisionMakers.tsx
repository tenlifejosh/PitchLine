import React from 'react'
import { Star, MapPin, Calendar } from 'lucide-react'

export default function BrowseDecisionMakers() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Decision Makers</h1>
        <p className="mt-2 text-gray-600">
          Find and book calls with industry experts
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500">
              <option value="">All Industries</option>
              <option value="tech">Technology</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="retail">Retail</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expertise
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500">
              <option value="">All Expertise</option>
              <option value="product">Product Management</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
              <option value="engineering">Engineering</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500">
              <option value="">Any Experience</option>
              <option value="1-5">1-5 years</option>
              <option value="6-10">6-10 years</option>
              <option value="11+">11+ years</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Decision Makers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sample Decision Maker Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-semibold">JD</span>
            </div>
            <div className="text-right">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm text-gray-600">5.0</span>
              </div>
              <span className="text-xs text-gray-500">12 reviews</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-1">John Doe</h3>
          <p className="text-sm text-gray-600 mb-2">VP of Product at TechCorp</p>
          
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span>San Francisco, CA</span>
          </div>

          <p className="text-sm text-gray-700 mb-4 line-clamp-3">
            15+ years in product management at scale. Expert in B2B SaaS, product strategy, 
            and go-to-market planning. Previously led product teams at major tech companies.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Product Strategy
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              B2B SaaS
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              Leadership
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-gray-900">$100</div>
            <button className="flex items-center px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors">
              <Calendar className="w-4 h-4 mr-2" />
              Book Call
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="col-span-full bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Decision Makers Found</h3>
          <p className="text-gray-600">
            Try adjusting your filters or check back later for new experts.
          </p>
        </div>
      </div>
    </div>
  )
}