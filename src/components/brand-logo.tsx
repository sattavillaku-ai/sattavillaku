import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtext?: boolean;
  className?: string;
  isLink?: boolean;
}

export function BrandLogo({
  size = 'md',
  showSubtext = true,
  className = '',
  isLink = true,
}: BrandLogoProps) {
  // Dimension classes for the official Sattavilakku logo banner
  const heightClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-9 sm:h-11',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
  };

  const content = (
    <div className={`inline-flex items-center group ${className}`}>
      <div className="relative overflow-hidden rounded-xs border border-primary/30 shadow-xs group-hover:shadow-md group-hover:border-primary transition-all duration-200 bg-[#e11d24]">
        <img
          src="/logo.jpg"
          alt="சட்டவிளக்கு (Sattavilakku) - அச்சம் தவிர்! சட்டம் பேசு!"
          className={`${heightClasses[size]} w-auto object-contain block group-hover:scale-102 transition-transform duration-200`}
          loading="eager"
        />
      </div>
    </div>
  );

  if (isLink) {
    return (
      <Link
        href="/"
        className="inline-block focus:outline-none focus:ring-2 focus:ring-primary rounded-xs transition-opacity hover:opacity-95"
        title="சட்டவிளக்கு - முகப்பு"
      >
        {content}
      </Link>
    );
  }

  return content;
}
