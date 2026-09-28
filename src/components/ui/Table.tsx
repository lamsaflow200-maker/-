/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className = '',
  ...props
}) => (
  <div className="w-full overflow-x-auto rounded-xl border border-[#E8DED8] bg-[#FFFFFF] shadow-xs">
    <table className={`w-full text-right text-sm ${className}`} {...props} />
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = '',
  ...props
}) => (
  <thead
    className={`bg-[#FAF7F2] border-b border-[#E8DED8] text-xs font-semibold text-[#6F6668] ${className}`}
    {...props}
  />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = '',
  ...props
}) => <tbody className={`divide-y divide-[#E8DED8] ${className}`} {...props} />;

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className = '',
  ...props
}) => (
  <tr
    className={`transition-colors hover:bg-[#FAF7F2] ${className}`}
    {...props}
  />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className = '',
  ...props
}) => <th className={`py-3 px-4 text-xs font-semibold text-[#6F6668] ${className}`} {...props} />;

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className = '',
  ...props
}) => <td className={`py-3 px-4 text-[#171316] ${className}`} {...props} />;
