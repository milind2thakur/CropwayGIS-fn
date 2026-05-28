'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Scan, FileText, Check, ArrowLeft } from 'lucide-react';
import { CropwayGisLogo } from '@/components/CropwayGisLogo';
import { cn } from '@/lib/utils';
import { RegisterPersonalDetails } from './RegisterPersonalDetails';
import { RegisterAadharVerification } from './RegisterAadharVerification';
import { RegisterLandDetails } from './RegisterLandDetails';

export type RegisterFormData = {
  // Personal Details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  pin: string;
  detailedAddress: string;
  
  // Aadhaar Details
  aadharNumber: string;
  aadharConsent: boolean;
  aadharOtp: string;

  // Land Details
  landDistrict: string;
  landTaluka: string;
  landVillage: string;
  landSurveyNo: string;
  landKhataNo: string;
  landTotalArea: string;
  landTotalAreaUnit: string;
  landActualArea: string;
  landActualAreaUnit: string;
  landOwnerName: string;
};

const initialFormData: RegisterFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  state: 'Chhattisgarh',
  city: 'Raipur',
  pin: '',
  detailedAddress: '',
  aadharNumber: '',
  aadharConsent: true,
  aadharOtp: '',
  landDistrict: '',
  landTaluka: '',
  landVillage: '',
  landSurveyNo: '',
  landKhataNo: '',
  landTotalArea: '0.00',
  landTotalAreaUnit: 'Acre',
  landActualArea: '0.00',
  landActualAreaUnit: 'Acre',
  landOwnerName: '',
};

export function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<RegisterFormData>(initialFormData);

  const updateFormData = (fields: Partial<RegisterFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const steps = [
    {
      title: 'Personal Details',
      description: 'Provide your personal details',
      icon: User,
    },
    {
      title: 'Aadhar Verification',
      description: 'Verify your entered Aadhar Id',
      icon: Scan,
    },
    {
      title: 'Land Details',
      description: 'Enter your land details',
      icon: FileText,
    },
  ];

  const handleNext = () => {
    if (step < 2) {
      setStep((prev) => prev + 1);
    } else {
      // Final Submission logic
      console.log('Registering user with data:', formData);
      router.push('/login');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr]">
        {/* Left Column: Stepper Sidebar */}
        <div className="flex flex-col bg-[#F3F6F9] px-8 py-12 lg:px-10">
          <div className="mt-16 flex-1 space-y-12">
            {steps.map((s, idx) => {
              const isCompleted = step > idx;
              const isActive = step === idx;
              const StepIcon = s.icon;

              return (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Stepper Line Connector */}
                  {idx < steps.length - 1 && (
                    <div
                      className={cn(
                        'absolute left-7 top-14 h-16 w-[2px]',
                        isCompleted ? 'bg-greenDark' : 'bg-black/10'
                      )}
                    />
                  )}

                  {/* Icon Indicator */}
                  <div
                    className={cn(
                      'flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] border transition-all duration-300',
                      isCompleted && 'border-greenDark bg-greenLight text-greenDark',
                      isActive && 'border-greenDark bg-white text-greenDark shadow-[0_4px_12px_rgba(64,115,39,0.15)]',
                      !isActive && !isCompleted && 'border-black/10 bg-white text-black/30'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-6 w-6" strokeWidth={2.5} />
                    ) : (
                      <StepIcon className="h-6 w-6" strokeWidth={1.5} />
                    )}
                  </div>

                  {/* Step Description */}
                  <div className="pt-1.5">
                    <h3
                      className={cn(
                        'font-montserrat text-[16px] font-semibold leading-[120%] transition-colors duration-300',
                        (isActive || isCompleted) ? 'text-greenDark' : 'text-black/40'
                      )}
                    >
                      {s.title}
                      {isCompleted && (
                        <Check className="ml-2 inline h-4 w-4 text-greenDark" strokeWidth={3} />
                      )}
                    </h3>
                    <p className="mt-1 font-montserrat text-[12px] font-medium leading-[120%] text-black/55">
                      {s.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Form Area */}
        <div className="flex flex-col bg-white px-8 py-8 sm:px-12 lg:px-[72px] lg:py-[52px]">
          {/* Top Row with Logo */}
          <div className="flex items-center justify-between">
            <CropwayGisLogo className="min-h-8" />
          </div>

          <div className="mt-8 flex w-full max-w-[620px] flex-col">
            {/* Back Button */}
            <div className="mb-8">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-[10px] bg-greenLight px-4 py-2 font-montserrat text-[14px] font-medium text-greenDark hover:bg-greenLightActive transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            </div>

            {/* Render Active Form Step */}
            {step === 0 && (
              <RegisterPersonalDetails
                formData={formData}
                updateFormData={updateFormData}
                onNext={handleNext}
              />
            )}
            {step === 1 && (
              <RegisterAadharVerification
                formData={formData}
                updateFormData={updateFormData}
                onNext={handleNext}
              />
            )}
            {step === 2 && (
              <RegisterLandDetails
                formData={formData}
                updateFormData={updateFormData}
                onNext={handleNext}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
