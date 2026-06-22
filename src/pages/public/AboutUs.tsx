import { motion } from 'motion/react';
import { useOrgSettings } from '../../hooks/useOrgSettings';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { 
  Heart, 
  BookOpen, 
  Compass, 
  Flame, 
  Target, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  Cross 
} from 'lucide-react';

export default function AboutUs() {
  useDocumentMeta({
    title: 'About Us',
    description: 'Learn about our history, core values, and the mission of New Nature in Christ Ministry.',
    keywords: 'about us, core values, history, NNCM, mission'
  });

  const { settings } = useOrgSettings();

  const coreValues = [
    {
      num: '1',
      title: 'LOVE',
      scripture: 'Luke 6:27-36, John 13:34-35, Matt 22:34-40',
      desc: 'The essence of our calling is summed up in a single word: LOVE. In a world that has romanticized and sexualized love, the church has a beautiful opportunity to show the love of God Himself.'
    },
    {
      num: '2',
      title: 'PROCLAIM',
      scripture: 'Acts 1:8; Romans 1:16; 2 Corinthians 2:17',
      desc: 'We celebrate that our God is a speaking God who has revealed Himself to us. The Bible is our inspired text, which He will never contradict.'
    },
    {
      num: '3',
      title: 'REACH',
      scripture: 'Matt 24:12-14',
      desc: 'While He who is not willing that any should perish calls us to take His loving message to everyone. Nations are coming to our neighborhoods, this will also be our opportunity.'
    },
    {
      num: '4',
      title: 'LAUNCH',
      scripture: 'Matt 9:35-38; Luke 19; Eph 2:8-10',
      desc: 'To accomplish the call God has given to us, we must see the entire body of Christ mobilized for the kingdom service. May God allow us to Launch new waves of Godly people.'
    }
  ];

  const doctrinalStatements = [
    { id: 1, title: 'One God', desc: 'There is one God, who is infinitely perfect existing eternally in three persons: Father, Son, and the Holy Spirit.' },
    { id: 2, title: 'Jesus Christ', desc: 'Jesus Christ is the true God and the true man. He was conceived by the Holy Spirit, born of the virgin Mary, died upon the cross, and rose from the dead.' },
    { id: 3, title: 'The Holy Spirit', desc: 'The Holy Spirit is a divine person, sent to indwell, guide, teach, empower believers and convince the world of sin, righteousness, and judgement.' },
    { id: 4, title: 'The Scripture', desc: 'The scriptures of old and new testament were inspired by God and are the only sufficient, certain, and authoritative rule of faith.' }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-100"
          >
            <Compass className="w-3.5 h-3.5" /> A Ministry Born of Vision
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-none mb-4">
            About Us & Our Purpose
          </h1>
          <p className="text-slate-500 font-light text-base sm:text-lg leading-relaxed">
            Discover our foundational story, doctrinal pillars, core values, and the divine call guiding {settings.orgName || 'New Nature In Christ Ministry'}.
          </p>
        </div>

        {/* Purpose Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-slate-100 p-8 sm:p-10 rounded-3xl shadow-sm"
          >
            <div className="p-3 bg-indigo-50 w-fit rounded-xl border border-indigo-100 inline-block mb-6">
              <Cross className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-950 mb-4">Our Purpose & Calling</h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-light mb-4">
              {settings.orgAbout || 'The church is a Pentecostal church fully relying on the Holy Spirit and His ministration. The purpose of the church is to preach and teach the word of God and make disciples of Jesus Christ.'}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,#4f46e512,transparent_55%)]" />
            
            <div className="relative z-10">
              <div className="p-3 bg-white/10 text-amber-300 w-fit rounded-xl border border-white/10 inline-block mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-4">Integrity & Excellence</h2>
              <p className="text-slate-300 text-sm leading-relaxed font-light">
                We declare and establish this ministry to preserve and protect the principles of our faith, and to uphold the independence of the church in autonomy of action.
              </p>
            </div>

            <div className="relative z-10 border-t border-white/15 pt-6 mt-6 font-mono text-[10px]">
              <span className="text-indigo-400 font-bold uppercase tracking-widest block mb-1">Standard Measure</span>
              <p className="text-slate-400">"I have been crucified with Christ; it is no longer I who live..." — Galatians 2:20</p>
            </div>
          </motion.div>
        </div>

        {/* Story & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {[
            { title: 'Vision', body: settings.vision || 'To reach the whole world with the word of Christ Jesus...', icon: Target, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
            { title: 'Mission', body: settings.mission || 'Preaching and teaching Christ where the name of the Lord has never been heard...', icon: Flame, color: 'text-rose-600 bg-rose-50 border-rose-100' },
            { title: 'Motto', body: settings.motto || 'NNC- Christ minded generation', icon: Sparkles, color: 'text-amber-600 bg-amber-50 border-amber-100' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`p-2.5 rounded-xl w-fit mb-6 border ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-950 mb-3">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-light">{item.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Core Values Section */}
        <div className="mb-24">
          <div className="max-w-2xl mb-12 text-center sm:text-left mx-auto sm:ml-0">
            <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">The Assembly Pillars</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">What We Stand For</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {coreValues.map((v, i) => (
              <div key={i} className="flex gap-6 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:ring-2 ring-indigo-50 transition-all">
                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700 shrink-0 text-sm">
                   {v.num}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-950 mb-1">{v.title}</h4>
                  <span className="text-[10px] font-mono text-indigo-500 font-bold uppercase tracking-wider block mb-2">{v.scripture}</span>
                  <p className="text-sm text-slate-500 leading-relaxed font-light">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
