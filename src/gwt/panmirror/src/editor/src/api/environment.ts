/*
 * environment.ts
 *
 * Copyright (C) 2021 by RStudio, PBC
 *
 * Unless you have received this program directly from RStudio pursuant
 * to the terms of a commercial license agreement with RStudio, then
 * this program is licensed to you under the terms of version 3 of the
 * GNU Affero General Public License. This program is distributed WITHOUT
 * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
 * AGPL (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.
 *
 */

export interface EnvironmentServer {
  getRPackageState: () => Promise<RPackageState>;
  getRPackageCitations: (pkgName: string) => Promise<RPackageCitation[]>; 
}

export interface RPackageState {
  package_list: RPackageInfo[];
}

export interface RPackageInfo {
  name: string;
  version: string | null;
  desc: string | null;
}

// https://stat.ethz.ch/R-manual/R-devel/library/utils/html/bibentry.html
export interface RPackageCitation {
  type: string;
  author: RPackageCitationAuthor[];
  title: string;
  doi?: string;
}

// https://stat.ethz.ch/R-manual/R-devel/library/utils/html/person.html
export interface RPackageCitationAuthor {
  given: string[];
  family: string;  
}