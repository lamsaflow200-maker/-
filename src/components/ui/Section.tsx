/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface SectionProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  title,
  description,
  action,
  children,
  className = '',
}) => {
  return (
    <section className={`mb-8 ${className}`}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E8DED8]">
          <div>
            {title && (
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#171316]">
                {title}
              </h2>
            )}
            {description && <p className="text-xs text-[#6F6668] mt-0.5">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
};
