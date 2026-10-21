"use client";

import { useEffect } from "react";
import { useApp } from "@/store/app";
import { Navbar, Footer } from "@/components/kavach/layout";
import { AuthDialog } from "@/components/kavach/auth";
import { Hero, FactsStrip, HowFlow, InvestorBenefits, CompareMatrix, OwnerSection } from "@/components/kavach/home";
import { Assurance, AmcSection, Partners } from "@/components/kavach/home-more";
import { Calculator, ProjectSpotlight, Faq, FinalCta } from "@/components/kavach/home-extras";
import { SafetyPage } from "@/components/kavach/safety";
import { ProjectsView, ProjectDetailView } from "@/components/kavach/projects";
import { InvestWizard } from "@/components/kavach/invest";
import { Dashboard } from "@/components/kavach/dashboard";
import { AgreementPage, PpaPage, TermsPage, PrivacyPage, AboutPage, ContactPage } from "@/components/kavach/legal";

export default function Home() {
  const { view, selectedProjectId, loadUser, userInitLoaded } = useApp();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {!userInitLoaded ? (
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <div className="h-10 w-56 animate-pulse rounded-lg bg-muted" />
            <div className="mt-4 h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <>
            {view === "home" && (
              <>
                <Hero />
                <FactsStrip />
                <HowFlow />
                <InvestorBenefits />
                <CompareMatrix />
                <Calculator />
                <ProjectSpotlight />
                <OwnerSection />
                <Assurance />
                <AmcSection />
                <Partners />
                <Faq />
                <FinalCta />
              </>
            )}
            {view === "projects" && <ProjectsView />}
            {view === "project" && selectedProjectId && <ProjectDetailView projectId={selectedProjectId} />}
            {view === "invest" && <InvestWizard />}
            {view === "dashboard" && <Dashboard />}
            {view === "agreement" && <AgreementPage />}
            {view === "ppa" && <PpaPage />}
            {view === "terms" && <TermsPage />}
            {view === "privacy" && <PrivacyPage />}
            {view === "about" && <AboutPage />}
            {view === "safety" && <SafetyPage />}
            {view === "contact" && <ContactPage />}
          </>
        )}
      </main>

      <Footer />
      <AuthDialog />
    </div>
  );
}
