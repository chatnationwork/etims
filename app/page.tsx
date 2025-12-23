'use client';

import { 
  ShieldCheck, 
  Globe, 
  FileText, 
  Calculator, 
  CreditCard, 
  Plane,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl translate-y-1/2"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-20">
        
        {/* Header/Nav (Visual only) */}
        <header className="flex justify-between items-center mb-20 lg:mb-32">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              ChatNation
            </span>
          </div>
          {/* No links as requested */}
        </header>

        {/* Hero Section */}
        <main className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Next-Gen Compliance Platform
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
              Simplifying <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400">
                Statutory Compliance
              </span>
            </h1>
            
            <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
              A unified ecosystem for seamless KRA tax filing, international travel declarations, and business invoicing. Experience the future of financial governance.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button className="px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-xl shadow-white/5 active:scale-95 transform duration-150">
                Get Started
              </button>
              <button className="px-8 py-4 bg-slate-800/50 border border-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors backdrop-blur-sm active:scale-95 transform duration-150">
                Learn More
              </button>
            </div>
          </div>

          <div className="relative">
             {/* Abstract UI Representation */}
             <div className="relative z-10 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-8 border-b border-slate-700/50 pb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  </div>
                  <div className="h-2 w-20 bg-slate-700/50 rounded-full"></div>
                </div>
                
                <div className="space-y-4">
                   {/* Mock Data Row */}
                   <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                      <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
                         <Plane className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="h-2 w-24 bg-slate-600 rounded-full mb-2"></div>
                        <div className="h-1.5 w-16 bg-slate-700 rounded-full"></div>
                      </div>
                      <div className="text-right">
                         <div className="h-6 w-16 bg-green-500/20 text-green-400 text-xs flex items-center justify-center rounded-full font-medium">Cleared</div>
                      </div>
                   </div>

                   <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                      <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                         <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="h-2 w-32 bg-slate-600 rounded-full mb-2"></div>
                        <div className="h-1.5 w-20 bg-slate-700 rounded-full"></div>
                      </div>
                      <div className="text-right">
                         <div className="h-6 w-16 bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center rounded-full font-medium">Filed</div>
                      </div>
                   </div>

                   <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                      <div className="p-3 bg-violet-500/10 rounded-lg text-violet-400">
                         <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="h-2 w-28 bg-slate-600 rounded-full mb-2"></div>
                        <div className="h-1.5 w-12 bg-slate-700 rounded-full"></div>
                      </div>
                      <div className="text-right">
                         <div className="h-6 w-16 bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center rounded-full font-medium">Active</div>
                      </div>
                   </div>
                </div>
             </div>
             
             {/* Decorative Blobs */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/30 rounded-full blur-2xl"></div>
             <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-500/30 rounded-full blur-2xl"></div>
          </div>
        </main>

        {/* Features Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          
          <FeatureCard 
            icon={Globe}
            title="F88 Customs Declaration"
            description="Simplified passenger declaration for international travel. Manage currency, restricted items, and luggage details with ease."
            color="blue"
          />

          <FeatureCard 
            icon={Calculator}
            title="eTIMS Management"
            description="Complete Electronic Tax Invoice Management. Handle sales invoices, credit notes, and buyer approvals in one secure place."
            color="violet"
          />

          <FeatureCard 
            icon={FileText}
            title="Tax Filing Automation"
            description="Effortless filing for NIL returns, Monthly Rental Income (MRI), and Turnover Tax (TOT). Compliance made instant."
            color="emerald"
          />

        </section>

        {/* Footer */}
        <footer className="mt-32 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} ChatNation. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
             <span>Terms</span>
             <span>Privacy</span>
             <span>Support</span>
          </div>
        </footer>

      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: any) {
  const colorClasses: any = {
    blue: "text-blue-400 group-hover:text-blue-300 bg-blue-500/10 group-hover:bg-blue-500/20 border-blue-500/20",
    violet: "text-violet-400 group-hover:text-violet-300 bg-violet-500/10 group-hover:bg-violet-500/20 border-violet-500/20",
    emerald: "text-emerald-400 group-hover:text-emerald-300 bg-emerald-500/10 group-hover:bg-emerald-500/20 border-emerald-500/20",
  };

  return (
    <div className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors border ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
        {description}
      </p>
    </div>
  );
}