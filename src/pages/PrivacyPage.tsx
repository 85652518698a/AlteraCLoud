import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Footer } from '../components/layout/Footer';
import { ShieldCheck, FileText, Database, Eye, Mail } from 'lucide-react';

const sections = [
  {
    icon: ShieldCheck,
    title: 'Introduction',
    content: `Altera-Cloud ("we," "our," or "us") is committed to protecting the privacy of students, faculty, and administrators who use our academic resource sharing platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform at alteracloud.space.`,
  },
  {
    icon: Database,
    title: 'Information We Collect',
    content: `When you sign in using Google Authentication, we receive the following information from your Google account: your name, email address, and profile photo. This information is used solely to create and maintain your account on our platform. We do not collect any additional personal information beyond what is provided through Google's authentication service.`,
  },
  {
    icon: Eye,
    title: 'How We Use Your Information',
    content: `We use the information collected for the following purposes: to authenticate your identity and grant you access to the platform, to personalize your experience by displaying your name and profile photo, to determine your role (admin or standard user) for access control purposes, to improve and optimize our platform based on usage patterns, and to communicate with you regarding platform updates or policy changes. We do not sell, rent, or trade your personal information to third parties.`,
  },
  {
    icon: ShieldCheck,
    title: 'Data Storage and Security',
    content: `All files uploaded to the platform are stored securely in Supabase Storage with restricted access controls. User account information is stored in Supabase databases with industry-standard encryption. Access to files is controlled through signed URLs with time-limited access, ensuring that only authenticated users can download resources. We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction.`,
  },
  {
    icon: FileText,
    title: 'File Content and User Conduct',
    content: `Users may upload educational materials such as notes, assignments, question papers, and lab manuals. We do not inspect or monitor the content of uploaded files beyond basic metadata. However, we reserve the right to remove any content that violates our Terms of Service or applicable laws. Users are solely responsible for the content they upload and must ensure they have the necessary rights to share such materials.`,
  },
  {
    icon: ShieldCheck,
    title: 'Data Retention',
    content: `We retain your account information for as long as your account remains active. If you choose to delete your account, your personal information will be removed from our systems within a reasonable timeframe. Uploaded files may be retained for backup and continuity purposes even after account deletion, but will no longer be associated with your personal information.`,
  },
  {
    icon: Mail,
    title: 'Contact Us',
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact the platform administrator through the official CSMU communication channels. We will respond to your inquiry within a reasonable timeframe.`,
  },
];

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between text-black selection:bg-[#FF3B30] selection:text-white">
      <div className="flex-1">
        <Navbar />
        <PageWrapper>
          <div className="max-w-3xl mx-auto">
            <div className="mb-12 text-left select-none border-b-4 border-black pb-8">
              <div className="section-heading">
                <ShieldCheck className="w-3 h-3 inline-block mr-1" />
                <span>LEGAL & COMPLIANCE</span>
              </div>
              <h2 className="font-display font-black text-2xl md:text-3xl tracking-wide uppercase text-black">
                Privacy Policy
              </h2>
              <p className="text-xs text-neutral-600 font-sans mt-2.5 leading-relaxed max-w-lg font-medium">
                Last updated: June 2026. Your privacy is important to us. This policy outlines how we handle your information.
              </p>
            </div>

            <div className="space-y-6">
              {sections.map((section, i) => {
                const Icon = section.icon;
                const iconColors = [
                  'bg-blue-600 text-white border-blue-600',
                  'bg-green-600 text-white border-green-600',
                  'bg-amber-400 text-black border-amber-400',
                  'bg-[#FF3B30] text-white border-[#FF3B30]',
                  'bg-blue-600 text-white border-blue-600',
                  'bg-green-600 text-white border-green-600',
                  'bg-amber-400 text-black border-amber-400',
                ];
                return (
                  <div key={section.title} className="border-3 border-black p-6 bg-white hover:translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150">
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 border-2 shrink-0 mt-0.5 ${iconColors[i % iconColors.length]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xs font-mono font-bold text-black uppercase tracking-wider">
                          {section.title}
                        </h3>
                        <p className="text-xs font-sans text-neutral-700 leading-relaxed font-medium">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 p-6 border-4 border-black bg-white text-center">
              <p className="text-xs font-mono text-black uppercase tracking-wider font-bold">
                ALTERA CLOUD • CHANNABASWESHWAR SYSTEM MANAGEMENT • CSMU RESOURCE LOCKER
              </p>
            </div>
          </div>
        </PageWrapper>
      </div>
      <Footer />
    </div>
  );
};
