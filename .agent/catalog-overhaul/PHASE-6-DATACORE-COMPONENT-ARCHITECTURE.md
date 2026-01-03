---
date: 2026-01-01
title: Phase 6 Component Architecture - Datacore Implementation Blueprint
document-type: technical-architecture
phase: 6
phase-step: "6.A - Architecture Design"
tags:
  - phase-6
  - architecture
  - datacore
  - react-components
  - component-specs
---

# Phase 6: Complete Datacore Component Architecture

*A detailed blueprint for building intelligent, reactive dashboards with Datacore/React for the Pulp Fiction Library.*

---

## 🏗️ Architecture Overview

### Design Principles

1. **Reactive Data Flow**: Components automatically update when underlying markdown files change
2. **Composability**: Build complex dashboards from simple, reusable components
3. **Immutability**: Data flows one direction (Obsidian → Store → Components)
4. **Performance**: Memoized computations, lazy loading, efficient re-renders
5. **Mobile-First**: All components render efficiently on both desktop and mobile
6. **Obsidian Integration**: Seamless embedding in markdown, using Obsidian's native APIs

---

## 📦 Core Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Obsidian Environment                     │
│                 (Markdown files + Plugins API)               │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│            Datacore Data Access Layer                        │
│  - File loading & parsing (YAML frontmatter extraction)     │
│  - Real-time subscriptions to file changes                  │
│  - Caching & revision tracking                              │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              Data Transformation Layer                       │
│  - Query functions (filter, sort, group, aggregate)        │
│  - Derived data computations                                │
│  - Memoization & performance optimization                   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              React Component Layer                           │
│  - Dashboard containers (StatusDashboard, PublicationDash)  │
│  - Display components (WorksTable, FilterBar, Charts)       │
│  - Interactive elements (Buttons, Selects, Checkboxes)      │
│  - Lifecycle management (hooks, effects)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│           Obsidian Markdown Rendering                        │
│      (Inline component display in markdown files)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Data Access & State Management

### File Loading Utility

**Purpose**: Extract work data from markdown files, maintain cache, subscribe to changes

**File**: `useWorksData.ts`

```typescript
/**
 * Hook for loading and subscribing to works data from vault
 * Returns cached work data + subscription to changes
 */
export function useWorksData(datacore: Datacore): {
  works: Work[];
  isLoading: boolean;
  error?: Error;
  revision: number; // Incremented on file changes
} {
  const [works, setWorks] = useState<Work[]>([]);
  const [revision, setRevision] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial load
    const loadWorks = async () => {
      try {
        const worksDir = datacore.query({
          type: 'file',
          path: 'works'
        });
        
        const workFiles = worksDir
          .filter(f => f.$extension === 'md' && f.$id !== 'works/README')
          .map(f => parseWork(f));
        
        setWorks(workFiles);
        setIsLoading(false);
      } catch (e) {
        console.error('Failed to load works:', e);
      }
    };

    loadWorks();

    // Subscribe to changes
    const handler = () => {
      loadWorks();
      setRevision(r => r + 1);
    };
    
    datacore.on('update', handler);
    return () => datacore.off('update', handler);
  }, [datacore]);

  return { works, isLoading, error: undefined, revision };
}

/**
 * Parse single work markdown file into Work object
 */
function parseWork(file: MarkdownPage): Work {
  return {
    id: file.$id,
    title: file.$frontmatter?.title?.value || 'Untitled',
    authors: file.$frontmatter?.authors?.value || [],
    year: file.$frontmatter?.year?.value || null,
    catalogStatus: file.$frontmatter?.['catalog-status']?.value || 'raw',
    bpCandidate: file.$frontmatter?.['bp-candidate']?.value === true,
    bpApproved: file.$frontmatter?.['bp-approved']?.value === true,
    publications: file.$frontmatter?.publications?.value || [],
    dateReviewed: file.$frontmatter?.['date-reviewed']?.value,
    dateApproved: file.$frontmatter?.['date-approved']?.value,
    dateCataloged: file.$frontmatter?.['date-cataloged']?.value,
    wordCount: file.$frontmatter?.['word-count']?.value || 0,
    keywords: file.$frontmatter?.keywords?.value || [],
    contentWarnings: file.$frontmatter?.['content-warnings']?.value || [],
  };
}

/**
 * Type definition for Work objects
 */
export interface Work {
  id: string;
  title: string;
  authors: string[];
  year?: number | null;
  catalogStatus: 'raw' | 'reviewed' | 'approved' | 'published';
  bpCandidate: boolean;
  bpApproved: boolean;
  publications: Array<{ link: string; display?: string }>;
  dateReviewed?: string;
  dateApproved?: string;
  dateCataloged?: string;
  wordCount: number;
  keywords: string[];
  contentWarnings: string[];
}
```

---

## 🎯 Query & Filter Layer

### Filter Functions Library

**Purpose**: Pure functions for filtering/transforming work data (no side effects, highly testable)

**File**: `queryFunctions.ts`

```typescript
// ============= STATUS FILTERS =============

export const StatusFilters = {
  raw: (work: Work) => work.catalogStatus === 'raw',
  reviewed: (work: Work) => work.catalogStatus === 'reviewed',
  approved: (work: Work) => work.catalogStatus === 'approved',
  published: (work: Work) => work.catalogStatus === 'published',
};

// ============= BP PIPELINE FILTERS =============

export const BackstageFilters = {
  candidates: (work: Work) => 
    work.catalogStatus === 'reviewed' && work.bpCandidate === true,
  approved: (work: Work) => 
    work.catalogStatus === 'approved' && work.bpApproved === true,
  archived: (work: Work) => 
    work.catalogStatus === 'reviewed' && work.bpCandidate !== true,
};

// ============= AUTHOR FILTERS =============

export function filterByAuthor(works: Work[], author: string): Work[] {
  return works.filter(w => 
    w.authors.includes(author)
  );
}

// ============= PUBLICATION FILTERS =============

export function filterByPublication(works: Work[], pubName: string): Work[] {
  return works.filter(w =>
    w.publications.some(pub => 
      pub.link.includes(pubName) || pub.display?.includes(pubName)
    )
  );
}

// ============= COMPOUND FILTERS =============

export function filterWorks(
  works: Work[],
  filters: {
    status?: string[];
    author?: string;
    publication?: string;
    bpCandidate?: boolean;
    yearRange?: [number, number];
  }
): Work[] {
  let result = [...works];

  if (filters.status?.length) {
    result = result.filter(w => filters.status!.includes(w.catalogStatus));
  }

  if (filters.author) {
    result = filterByAuthor(result, filters.author);
  }

  if (filters.publication) {
    result = filterByPublication(result, filters.publication);
  }

  if (filters.bpCandidate !== undefined) {
    result = result.filter(w => w.bpCandidate === filters.bpCandidate);
  }

  if (filters.yearRange) {
    const [min, max] = filters.yearRange;
    result = result.filter(w => w.year && w.year >= min && w.year <= max);
  }

  return result;
}

// ============= SORT FUNCTIONS =============

export const SortFunctions = {
  byTitle: (a: Work, b: Work) => a.title.localeCompare(b.title),
  byTitleDesc: (a: Work, b: Work) => b.title.localeCompare(a.title),
  
  byYear: (a: Work, b: Work) => (a.year || 0) - (b.year || 0),
  byYearDesc: (a: Work, b: Work) => (b.year || 0) - (a.year || 0),
  
  byWordCount: (a: Work, b: Work) => (a.wordCount || 0) - (b.wordCount || 0),
  byWordCountDesc: (a: Work, b: Work) => (b.wordCount || 0) - (a.wordCount || 0),
  
  byDateReviewed: (a: Work, b: Work) => 
    new Date(b.dateReviewed || 0).getTime() - 
    new Date(a.dateReviewed || 0).getTime(),
  
  byDateApproved: (a: Work, b: Work) => 
    new Date(a.dateApproved || 0).getTime() - 
    new Date(b.dateApproved || 0).getTime(),
};

// ============= GROUP FUNCTIONS =============

export function groupByStatus(works: Work[]): Map<string, Work[]> {
  const groups = new Map<string, Work[]>();
  
  works.forEach(work => {
    if (!groups.has(work.catalogStatus)) {
      groups.set(work.catalogStatus, []);
    }
    groups.get(work.catalogStatus)!.push(work);
  });

  return groups;
}

export function groupByAuthor(works: Work[]): Map<string, Work[]> {
  const groups = new Map<string, Work[]>();
  
  works.forEach(work => {
    work.authors.forEach(author => {
      if (!groups.has(author)) {
        groups.set(author, []);
      }
      groups.get(author)!.push(work);
    });
  });

  return groups;
}

export function groupByYear(works: Work[]): Map<number, Work[]> {
  const groups = new Map<number, Work[]>();
  
  works.forEach(work => {
    if (work.year) {
      if (!groups.has(work.year)) {
        groups.set(work.year, []);
      }
      groups.get(work.year)!.push(work);
    }
  });

  // Sort years ascending
  return new Map(
    Array.from(groups.entries()).sort((a, b) => a[0] - b[0])
  );
}

// ============= AGGREGATE FUNCTIONS =============

export function countByStatus(works: Work[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  works.forEach(work => {
    counts[work.catalogStatus] = (counts[work.catalogStatus] || 0) + 1;
  });

  return counts;
}

export function totalWordCount(works: Work[]): number {
  return works.reduce((sum, w) => sum + (w.wordCount || 0), 0);
}

export function averageWordCount(works: Work[]): number {
  if (works.length === 0) return 0;
  return totalWordCount(works) / works.length;
}

export function getYearRange(works: Work[]): [number, number] | null {
  const years = works
    .map(w => w.year)
    .filter((y): y is number => y !== null && y !== undefined);
  
  if (years.length === 0) return null;
  
  return [Math.min(...years), Math.max(...years)];
}
```

---

## ⚛️ React Components Specifications

### 1. StatusDashboard Component

**Purpose**: Overview of all works grouped by catalog-status with counts

**Props & Usage:**
```typescript
interface StatusDashboardProps {
  datacore: Datacore;
  className?: string;
}

export function StatusDashboard({ datacore, className }: StatusDashboardProps) {
  const { works, isLoading, revision } = useWorksData(datacore);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  // Compute status summary when works change
  useEffect(() => {
    const counts = countByStatus(works);
    setStatusCounts(counts);
  }, [works]);

  if (isLoading) {
    return <div className={className}>Loading...</div>;
  }

  return (
    <div className={combineClasses('dc-status-dashboard', className)}>
      <h3>Status Summary</h3>
      <table className="dc-status-table">
        <thead>
          <tr>
            <th>Catalog Status</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {['raw', 'reviewed', 'approved', 'published'].map(status => (
            <tr key={status}>
              <td>{status}</td>
              <td>{statusCounts[status] || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="dc-stats">
        <p>Total Works: {works.length}</p>
        <p>Total Words: {totalWordCount(works).toLocaleString()}</p>
        <p>Average Per Story: {averageWordCount(works).toFixed(0)} words</p>
      </div>
    </div>
  );
}
```

---

### 2. WorksTable Component

**Purpose**: Sortable, filterable table display of works with multiple views

**Props & Usage:**
```typescript
interface WorksTableProps {
  works: Work[];
  columns?: (keyof Work)[];
  sortBy?: keyof Work;
  sortDesc?: boolean;
  onSort?: (column: keyof Work) => void;
  rowRenderer?: (work: Work) => ReactNode;
  pagination?: { pageSize: number };
  className?: string;
}

export function WorksTable({
  works,
  columns = ['title', 'authors', 'year', 'wordCount', 'catalogStatus'],
  sortBy = 'title',
  sortDesc = false,
  onSort,
  pagination,
  className,
}: WorksTableProps) {
  const [currentSort, setCurrentSort] = useState<{ column: keyof Work; desc: boolean }>({
    column: sortBy,
    desc: sortDesc,
  });

  // Sort works based on current sort state
  const sortedWorks = useMemo(() => {
    const sorted = [...works].sort((a, b) => {
      const aVal = a[currentSort.column];
      const bVal = b[currentSort.column];
      
      if (typeof aVal === 'string') {
        return currentSort.desc 
          ? (bVal as string).localeCompare(aVal as string)
          : (aVal as string).localeCompare(bVal as string);
      }
      
      return currentSort.desc ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
    });
    return sorted;
  }, [works, currentSort]);

  const displayWorks = pagination 
    ? sortedWorks.slice(0, pagination.pageSize)
    : sortedWorks;

  const handleSort = (column: keyof Work) => {
    if (currentSort.column === column) {
      setCurrentSort(s => ({ ...s, desc: !s.desc }));
    } else {
      setCurrentSort({ column, desc: false });
    }
    onSort?.(column);
  };

  return (
    <div className={combineClasses('dc-works-table', className)}>
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={String(col)}
                onClick={() => handleSort(col)}
                className={currentSort.column === col ? 'active' : ''}
              >
                {String(col).replace(/-/g, ' ')}
                {currentSort.column === col && (
                  <span className="sort-indicator">
                    {currentSort.desc ? ' ▼' : ' ▲'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayWorks.map(work => (
            <tr key={work.id}>
              {columns.map(col => (
                <td key={`${work.id}-${String(col)}`}>
                  {renderCell(work, col)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper to render table cell values
function renderCell(work: Work, column: keyof Work): ReactNode {
  const value = work[column];
  
  if (column === 'authors' && Array.isArray(value)) {
    return value.join(', ');
  }
  
  if (column === 'publications' && Array.isArray(value)) {
    return value.map(p => p.display || p.link).join(', ');
  }
  
  if (value === null || value === undefined) {
    return '-';
  }
  
  return String(value);
}
```

---

### 3. FilterBar Component

**Purpose**: Multi-select, interactive filtering of works with real-time preview

**Props & Usage:**
```typescript
interface FilterBarProps {
  works: Work[];
  onFilter: (filteredWorks: Work[]) => void;
  className?: string;
}

export function FilterBar({ works, onFilter, className }: FilterBarProps) {
  const [filters, setFilters] = useState({
    status: [] as string[],
    author: null as string | null,
    bpCandidateOnly: false,
  });

  // Get unique values for dropdowns
  const authors = useMemo(() => {
    const authorSet = new Set<string>();
    works.forEach(w => w.authors.forEach(a => authorSet.add(a)));
    return Array.from(authorSet).sort();
  }, [works]);

  // Apply filters and update parent
  useEffect(() => {
    const filtered = filterWorks(works, {
      status: filters.status.length > 0 ? filters.status : undefined,
      author: filters.author || undefined,
      bpCandidate: filters.bpCandidateOnly ? true : undefined,
    });
    onFilter(filtered);
  }, [filters, works, onFilter]);

  const handleStatusToggle = (status: string) => {
    setFilters(f => ({
      ...f,
      status: f.status.includes(status)
        ? f.status.filter(s => s !== status)
        : [...f.status, status],
    }));
  };

  return (
    <div className={combineClasses('dc-filter-bar', className)}>
      <div className="filter-section">
        <h4>Catalog Status</h4>
        {['raw', 'reviewed', 'approved', 'published'].map(status => (
          <label key={status}>
            <input
              type="checkbox"
              checked={filters.status.includes(status)}
              onChange={() => handleStatusToggle(status)}
            />
            {status}
          </label>
        ))}
      </div>

      <div className="filter-section">
        <h4>Author</h4>
        <select
          value={filters.author || ''}
          onChange={(e) => setFilters(f => ({ ...f, author: e.target.value || null }))}
        >
          <option value="">All Authors</option>
          {authors.map(author => (
            <option key={author} value={author}>
              {author}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label>
          <input
            type="checkbox"
            checked={filters.bpCandidateOnly}
            onChange={(e) => setFilters(f => ({ ...f, bpCandidateOnly: e.target.checked }))}
          />
          BP Candidates Only
        </label>
      </div>
    </div>
  );
}
```

---

### 4. PublicationDashboard Component

**Purpose**: Display all works for a specific publication with dataview-style querying

**Props & Usage:**
```typescript
interface PublicationDashboardProps {
  publicationName: string;
  datacore: Datacore;
  className?: string;
}

export function PublicationDashboard({
  publicationName,
  datacore,
  className,
}: PublicationDashboardProps) {
  const { works, isLoading } = useWorksData(datacore);
  const [publicationWorks, setPublicationWorks] = useState<Work[]>([]);

  // Filter to works in this publication
  useEffect(() => {
    const filtered = filterByPublication(works, publicationName);
    setPublicationWorks(filtered.sort(SortFunctions.byTitle));
  }, [works, publicationName]);

  if (isLoading) {
    return <div className={className}>Loading...</div>;
  }

  return (
    <div className={combineClasses('dc-publication-dashboard', className)}>
      <h3>{publicationName}</h3>
      <p className="work-count">
        {publicationWorks.length} work{publicationWorks.length !== 1 ? 's' : ''}
      </p>
      
      <WorksTable
        works={publicationWorks}
        columns={['title', 'authors', 'catalogStatus', 'wordCount']}
      />
    </div>
  );
}
```

---

### 5. AuthorCard Component

**Purpose**: Works by a single author with statistics

**Props & Usage:**
```typescript
interface AuthorCardProps {
  authorName: string;
  datacore: Datacore;
  className?: string;
}

export function AuthorCard({
  authorName,
  datacore,
  className,
}: AuthorCardProps) {
  const { works, isLoading } = useWorksData(datacore);
  const [authorWorks, setAuthorWorks] = useState<Work[]>([]);

  useEffect(() => {
    const filtered = filterByAuthor(works, authorName);
    setAuthorWorks(filtered.sort(SortFunctions.byYear));
  }, [works, authorName]);

  if (isLoading) {
    return <div className={className}>Loading...</div>;
  }

  const yearRange = getYearRange(authorWorks);

  return (
    <div className={combineClasses('dc-author-card', className)}>
      <h3>{authorName}</h3>
      
      <div className="author-stats">
        <div className="stat">
          <span className="label">Stories Written:</span>
          <span className="value">{authorWorks.length}</span>
        </div>
        {yearRange && (
          <div className="stat">
            <span className="label">Active Years:</span>
            <span className="value">{yearRange[0]} - {yearRange[1]}</span>
          </div>
        )}
        <div className="stat">
          <span className="label">Total Words:</span>
          <span className="value">{totalWordCount(authorWorks).toLocaleString()}</span>
        </div>
      </div>

      <h4>Works</h4>
      <WorksTable
        works={authorWorks}
        columns={['title', 'year', 'catalogStatus', 'wordCount']}
      />
    </div>
  );
}
```

---

### 6. BackstagePassPipeline Component

**Purpose**: Specialized dashboard for BP editorial workflow tracking

**Props & Usage:**
```typescript
interface BackstagePassPipelineProps {
  datacore: Datacore;
  className?: string;
}

export function BackstagePassPipeline({
  datacore,
  className,
}: BackstagePassPipelineProps) {
  const { works } = useWorksData(datacore);

  // Compute BP pipeline stages
  const candidates = useMemo(() => 
    works.filter(BackstageFilters.candidates),
    [works]
  );

  const approved = useMemo(() => 
    works.filter(BackstageFilters.approved),
    [works]
  );

  const archived = useMemo(() => 
    works.filter(BackstageFilters.archived),
    [works]
  );

  return (
    <div className={combineClasses('dc-bp-pipeline', className)}>
      <h3>Backstage Pass Editorial Pipeline</h3>

      <div className="pipeline-sections">
        <section className="pipeline-stage candidates">
          <h4>BP Candidates ({candidates.length})</h4>
          <p className="stage-description">Reviewed, awaiting approval</p>
          <WorksTable
            works={candidates}
            columns={['title', 'authors', 'dateReviewed', 'wordCount']}
            sortBy="dateReviewed"
            sortDesc={true}
          />
        </section>

        <section className="pipeline-stage approved">
          <h4>BP Approved ({approved.length})</h4>
          <p className="stage-description">In editorial/production pipeline</p>
          <WorksTable
            works={approved}
            columns={['title', 'authors', 'dateApproved', 'wordCount']}
            sortBy="dateApproved"
            sortDesc={false}
          />
        </section>

        <section className="pipeline-stage archived">
          <h4>Archived ({archived.length})</h4>
          <p className="stage-description">Reviewed but not selected</p>
          <WorksTable
            works={archived}
            columns={['title', 'authors', 'dateReviewed']}
            pagination={{ pageSize: 10 }}
          />
        </section>
      </div>

      <div className="pipeline-stats">
        <p><strong>Total Candidates:</strong> {candidates.length}</p>
        <p><strong>Approval Rate:</strong> {candidates.length > 0 ? ((approved.length / candidates.length) * 100).toFixed(1) : 0}%</p>
        <p><strong>Candidate → Approved:</strong> {approved.length} stories</p>
      </div>
    </div>
  );
}
```

---

## 🎣 Custom Hooks Library

### useFilters Hook

```typescript
interface UseFiltersOptions {
  works: Work[];
  initialFilters?: Partial<typeof defaultFilters>;
}

const defaultFilters = {
  status: [] as string[],
  author: null as string | null,
  publication: null as string | null,
  bpCandidate: undefined as boolean | undefined,
  yearRange: null as [number, number] | null,
};

export function useFilters(
  works: Work[],
  options: UseFiltersOptions
) {
  const [filters, setFilters] = useState(options.initialFilters || defaultFilters);

  const filteredWorks = useMemo(() => 
    filterWorks(works, filters),
    [works, filters]
  );

  const updateFilter = (key: string, value: any) => {
    setFilters(f => ({ ...f, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return {
    filters,
    filteredWorks,
    updateFilter,
    resetFilters,
  };
}
```

### useSorting Hook

```typescript
export function useSorting(works: Work[], initialColumn: keyof Work = 'title') {
  const [sorting, setSorting] = useState({ column: initialColumn, desc: false });

  const sortedWorks = useMemo(() => {
    const sorted = [...works];
    const sortFn = SortFunctions[`by${sorting.column}`] || SortFunctions.byTitle;
    sorted.sort(sortFn);
    
    if (sorting.desc) {
      sorted.reverse();
    }
    
    return sorted;
  }, [works, sorting]);

  const toggleSort = (column: keyof Work) => {
    setSorting(s => ({
      column,
      desc: s.column === column ? !s.desc : false,
    }));
  };

  return { sorting, sortedWorks, toggleSort };
}
```

---

## 📐 Type Definitions

**File**: `types.ts`

```typescript
// Work data structure (parsed from markdown frontmatter)
export interface Work {
  id: string;
  title: string;
  authors: string[];
  year?: number | null;
  catalogStatus: 'raw' | 'reviewed' | 'approved' | 'published';
  bpCandidate: boolean;
  bpApproved: boolean;
  publications: Array<{ link: string; display?: string }>;
  dateReviewed?: string;
  dateApproved?: string;
  dateCataloged?: string;
  wordCount: number;
  keywords: string[];
  contentWarnings: string[];
}

// Dashboard state
export interface DashboardState {
  works: Work[];
  isLoading: boolean;
  error?: Error;
  filters: FilterState;
  sorting: SortingState;
}

// Filter state
export interface FilterState {
  status: string[];
  author?: string;
  publication?: string;
  bpCandidate?: boolean;
  yearRange?: [number, number];
}

// Sorting state
export interface SortingState {
  column: keyof Work;
  desc: boolean;
}

// Statistics
export interface WorkStatistics {
  total: number;
  byStatus: Record<string, number>;
  totalWords: number;
  averageWords: number;
  yearRange?: [number, number];
}
```

---

## 🔌 Obsidian Integration Points

### Embedding in Markdown

Components render as inline React elements within markdown files using Obsidian's MarkdownRenderChild:

```typescript
// In Obsidian settings (plugin setup)
app.metadataCache.onMarkdownEvent('datacore-block', (content) => {
  // Parse code block config
  const config = parseConfig(content);
  
  // Render appropriate component
  switch (config.component) {
    case 'status-dashboard':
      return <StatusDashboard datacore={this.datacore} />;
    case 'publications':
      return <PublicationDashboard 
        publicationName={config.publication}
        datacore={this.datacore} 
      />;
    // ... etc
  }
});
```

### Data Synchronization

Components subscribe to Obsidian's file update events:

```typescript
// In useWorksData hook
datacore.on('update', (revision) => {
  // Reload works when vault changes
  reloadWorks();
  setRevision(revision);
});

datacore.on('rename', (newPath, oldPath) => {
  // Handle file renames
  reloadWorks();
});
```

---

## ⚡ Performance Optimizations

### Memoization Strategy

```typescript
// Memoize expensive computations
const statusCounts = useMemo(() => countByStatus(works), [works]);
const sortedWorks = useMemo(() => sortWorks(works, sortBy), [works, sortBy]);
const filteredWorks = useMemo(() => filterWorks(works, filters), [works, filters]);

// Memoize callbacks to prevent child re-renders
const handleSort = useCallback((column) => {
  setSorting({ column, desc: false });
}, []);

// Wrap components to prevent unnecessary re-renders
export const StatusDashboard = memo(StatusDashboardComponent);
```

### Lazy Loading

```typescript
// Load publication works only when component mounts
const [works, setWorks] = useState<Work[] | null>(null);

useEffect(() => {
  const timer = setTimeout(() => {
    setWorks(filterByPublication(allWorks, publicationName));
  }, 0);
  
  return () => clearTimeout(timer);
}, [publicationName, allWorks]);
```

### Pagination

```typescript
// Display paginated results for large lists
const itemsPerPage = 50;
const totalPages = Math.ceil(works.length / itemsPerPage);

const paginatedWorks = useMemo(() => {
  const start = currentPage * itemsPerPage;
  return works.slice(start, start + itemsPerPage);
}, [works, currentPage]);
```

---

## 📱 Mobile Optimization

### Responsive Behavior

```typescript
// Check for mobile environment
function isMobile() {
  return window.innerWidth < 768 || navigator.maxTouchPoints > 2;
}

// Conditional rendering for mobile
{isMobile() ? (
  <MobileWorksList works={works} />
) : (
  <WorksTable works={works} />
)}
```

### Touch-Friendly Interactions

```typescript
// Larger touch targets
.dc-filter-section label {
  padding: 12px; // Larger than 44px touch target
  display: block;
  margin: 8px 0;
}

// Avoid hover states
.dc-table th:active {
  background-color: var(--color-base-30);
}
```

---

## 🗂️ File Organization

```
src/
├── components/
│   ├── StatusDashboard.tsx
│   ├── WorksTable.tsx
│   ├── FilterBar.tsx
│   ├── PublicationDashboard.tsx
│   ├── AuthorCard.tsx
│   └── BackstagePassPipeline.tsx
├── hooks/
│   ├── useWorksData.ts
│   ├── useFilters.ts
│   ├── useSorting.ts
│   └── useDatacore.ts
├── queries/
│   └── queryFunctions.ts
├── types/
│   └── types.ts
├── utils/
│   ├── parseWork.ts
│   └── helpers.ts
├── styles/
│   ├── components.css
│   ├── dashboard.css
│   └── variables.css
└── index.ts
```

---

## 🧪 Testing Strategy

### Unit Tests (Query Functions)

```typescript
// Test filter functions with pure data
describe('StatusFilters', () => {
  it('filters by raw status', () => {
    const works = [
      { catalogStatus: 'raw' },
      { catalogStatus: 'reviewed' },
    ];
    expect(works.filter(StatusFilters.raw)).toHaveLength(1);
  });
});
```

### Component Tests (React Testing Library)

```typescript
describe('StatusDashboard', () => {
  it('renders status counts', () => {
    const { getByText } = render(
      <StatusDashboard datacore={mockDatacore} />
    );
    expect(getByText('raw')).toBeInTheDocument();
  });
});
```

### Integration Tests (E2E with Obsidian)

```typescript
describe('Datacore Integration', () => {
  it('updates dashboard when work file changes', async () => {
    // Modify work file
    await app.vault.modify(workFile, newContent);
    
    // Assert component updates
    await waitFor(() => {
      expect(getByText('New Title')).toBeInTheDocument();
    });
  });
});
```

---

## 🚀 Implementation Roadmap (Phase 6 Breakdown)

### Session 1: Setup & Utilities
- [ ] Create useWorksData hook with file loading
- [ ] Implement queryFunctions library (all filters, sorts, aggregates)
- [ ] Define Work type and data structures
- [ ] Set up file organization structure

### Session 2: Core Components
- [ ] Build StatusDashboard component
- [ ] Build WorksTable component with sorting
- [ ] Build FilterBar component
- [ ] Create custom hooks (useFilters, useSorting)

### Session 3: Specialized Dashboards
- [ ] Build PublicationDashboard component
- [ ] Build AuthorCard component
- [ ] Build BackstagePassPipeline component
- [ ] Integrate with Obsidian markdown rendering

### Session 4: Testing & Optimization
- [ ] Write unit tests for query functions
- [ ] Write component tests
- [ ] Performance profiling & memoization tuning
- [ ] Mobile optimization pass

### Session 5: Migration & Documentation
- [ ] Replace Dataview queries with Datacore components
- [ ] Update Pulp Fiction.md to use new components
- [ ] Update publication dashboards
- [ ] Write API documentation & usage guide

---

**Document Version:** 1.0  
**Next Step**: Review and approve component specifications  
**Timeline Estimate**: 5 sessions for complete Phase 6 implementation  
**Dependencies**: Datacore plugin installed in Obsidian vault

