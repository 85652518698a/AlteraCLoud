import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Footer } from '../components/layout/Footer';
import { FileText, ShieldCheck, AlertTriangle, Eye, Mail } from 'lucide-react';

const sections = [
  {
    icon: FileText,
    title: 'Acceptance of Terms',
    content: `By accessing or using Altera-Cloud ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use the Platform. These terms apply to all visitors, users, and administrators of the Platform. Continued use of the Platform constitutes acceptance of any future modifications to these terms.`,
  },
  {
    icon: FileText,
    title: 'Description of Service',
    content: `Altera-Cloud is an academic resource sharing platform designed for CSMU students and faculty. The Platform allows authorized users to upload, view, download, and manage educational materials including notes, assignments, question papers, question banks, and lab manuals. Files are stored securely and access is controlled through authentication and authorization mechanisms.`,
  },
  {
    icon: Eye,
    title: 'User Accounts and Authentication',
    content: `Access to the Platform requires authentication via Google Sign-In. You must provide accurate and complete information during the authentication process. You are responsible for maintaining the confidentiality of your Google account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    icon: ShieldCheck,
    title: 'User Conduct and Prohibited Content',
    content: `Users must not upload, share, or distribute any content that: infringes upon intellectual property rights or copyrights of others, contains malware, viruses, or any harmful code, violates any applicable laws or regulations, contains hateful, discriminatory, or defamatory material, includes personally identifiable information of others without consent, or promotes illegal activities. Administrators reserve the right to review, remove, or modify any content that violates these policies without prior notice.`,
  },
  {
    icon: AlertTriangle,
    title: 'Intellectual Property',
    content: `Users retain ownership of the content they upload to the Platform. By uploading content, you grant Altera-Cloud a non-exclusive, royalty-free license to store, display, and distribute the content for the purpose of operating the educational platform. You represent and warrant that you have the necessary rights to share the uploaded content and that it does not violate any third-party rights.`,
  },
  {
    icon: ShieldCheck,
    title: 'Limitation of Liability',
    content: `The Platform is provided on an "as is" and "as available" basis for educational purposes. We make no warranties, expressed or implied, regarding the availability, accuracy, or reliability of the Platform or its content. In no event shall Altera-Cloud, its administrators, or affiliates be liable for any direct, indirect, incidental, or consequential damages arising from your use of the Platform. Users access and use all content at their own risk.`,
  },
  {
    icon: Mail,
    title: 'Modifications and Termination',
    content: `We reserve the right to modify these terms at any time. Users will be notified of material changes through the Platform or via email. Continued use after changes constitutes acceptance of the modified terms. We also reserve the right to suspend or terminate access to the Platform for any user who violates these terms, at our sole discretion and without prior notice.`,
  },
];

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between text-black selection:bg-[#FF3B30] selection:text-white">
      <div className="flex-1">
        <Navbar />
        <PageWrapper>
          <div className="max-w-3xl mx-auto">
            <div className="mb-12 text-left select-none border-b-4 border-black pb-8">
              <div className="section-heading">
                <FileText className="w-3 h-3 inline-block mr-1" />
                <span>LEGAL & COMPLIANCE</span>
              </div>
              <h2 className="font-display font-black text-2xl md:text-3xl tracking-wide uppercase text-black">
                Terms of Service
              </h2>
              <p className="text-xs text-neutral-600 font-sans mt-2.5 leading-relaxed max-w-lg font-medium">
                Last updated: June 2026. Please read these terms carefully before using the Platform.
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
                        <p className="text-[11px] font-sans text-neutral-700 leading-relaxed font-medium">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 p-6 border-4 border-black bg-white text-center">
              <p className="text-[10px] font-mono text-black uppercase tracking-wider font-bold">
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
