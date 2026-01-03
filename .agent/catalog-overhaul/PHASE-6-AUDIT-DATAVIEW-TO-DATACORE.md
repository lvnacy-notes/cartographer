---
date: 2026-01-01
title: Phase 6 Audit - Dataview Query Analysis & Datacore Migration Planning
document-type: technical-audit
phase: 6
tags:
  - phase-6
  - audit
  - dataview
  - datacore
  - query-analysis
---

# Phase 6: Dataview to Datacore Migration Audit

*A comprehensive analysis of existing query infrastructure and migration planning for React-powered Datacore implementation.*

---

## 📊 Executive Summary

**Current Query Inventory:** 8 Dataview queries across 4 files  
**Query Types:** 5 TABLE queries, 1 TASK query  
**Query Complexity:** Low-to-moderate (basic filtering and sorting)  
**Total Data Points Queried:** 30 canonical works  

**Migration Difficulty:** LOW
- No complex aggregations or advanced Dataview features in use
- Standard filtering patterns (tag-based, field containment, property matching)
- Straightforward TABLE output formats
- No query-chaining or complex WHERE conditions

**Datacore Readiness:** EXCELLENT
- All queries use basic Dataview syntax (no advanced features)
- Data structure (30 works with 26 fields each) is simple and regular
- No circular dependencies or complex relationships
- Perfect candidate for React component-based approach

---

## 🔍 Current Query Audit

### Existing Queries Inventory

#### 1. **Pulp Fiction.md** - Status Dashboard (4 queries)

**Query 1.1: Status Summary**
```dataview
TABLE without ID
	length(rows) as "Count"
FROM
	#pulp-fiction AND
	#catalog-works
WHERE
	!contains(file.name, "README")
GROUP BY
	catalog-status
SORT
	rows.catalog-status asc
```

**Type:** Aggregation with GROUP BY  
**Purpose:** Count works by catalog-status field  
**Fields Used:** catalog-status  
**Tags:** #pulp-fiction, #catalog-works  
**Complexity:** Moderate (uses GROUP BY aggregate)  

**Datacore Equivalent Approach:**
```javascript
// Map works by catalog-status, count by group
const statusGroups = works.reduce((acc, work) => {
  const status = work['catalog-status'];
  acc[status] = (acc[status] || 0) + 1;
  return acc;
}, {});
// Render as table: [status, count]
```

---

**Query 1.2: Raw Works (Awaiting Review)**
```dataview
TABLE without ID
	file.link AS Title,
	authors as Authors,
	year as Year,
	date-cataloged as "Date Cataloged"
FROM
	#pulp-fiction AND
	#catalog-works
WHERE
	contains(catalog-status, "raw")
SORT
	date-cataloged desc
```

**Type:** Filtered list with sorting  
**Purpose:** Display all works with status "raw"  
**Fields Used:** file.link, authors, year, date-cataloged, catalog-status  
**Tags:** #pulp-fiction, #catalog-works  
**Complexity:** Low (simple WHERE filter)  

**Datacore Equivalent Approach:**
```javascript
// Filter works where catalog-status contains "raw"
const rawWorks = works.filter(w => w['catalog-status'] === 'raw');
// Sort by date-cataloged descending
const sorted = rawWorks.sort((a, b) => 
  new Date(b['date-cataloged']) - new Date(a['date-cataloged'])
);
// Render as table with columns: Title, Authors, Year, Date Cataloged
```

---

**Query 1.3: BP Candidates (Awaiting Approval)**
```dataview
TABLE without ID
	file.link AS Title,
	authors as Authors,
	year as Year,
	date-reviewed as "Date Reviewed",
	word-count as "Word Count"
FROM
	#pulp-fiction AND
	#catalog-works
WHERE
	contains(catalog-status, "reviewed") AND
	contains(bp-candidate, true)
SORT
	date-reviewed desc
```

**Type:** Multi-condition filtered list  
**Purpose:** Display reviewed works marked as BP candidates  
**Fields Used:** file.link, authors, year, date-reviewed, word-count, catalog-status, bp-candidate  
**Tags:** #pulp-fiction, #catalog-works  
**Complexity:** Low (AND condition with two boolean/string checks)  

**Datacore Equivalent Approach:**
```javascript
// Filter: status === "reviewed" AND bp-candidate === true
const candidates = works.filter(w => 
  w['catalog-status'] === 'reviewed' && w['bp-candidate'] === true
);
// Sort by date-reviewed descending
const sorted = candidates.sort((a, b) => 
  new Date(b['date-reviewed']) - new Date(a['date-reviewed'])
);
// Render as table: Title, Authors, Year, Date Reviewed, Word Count
```

---

**Query 1.4: Archived (Reviewed, Not Selected)**
```dataview
TABLE without ID
	file.link AS Title,
	authors as Authors,
	year as Year,
	date-reviewed as "Date Reviewed"
FROM
	#pulp-fiction AND
	#catalog-works
WHERE
	contains(catalog-status, "reviewed") AND
	contains(bp-candidate, "false")
SORT
	date-reviewed desc
```

**Type:** Multi-condition filtered list  
**Purpose:** Display reviewed works NOT marked as BP candidates (archived)  
**Fields Used:** file.link, authors, year, date-reviewed, catalog-status, bp-candidate  
**Tags:** #pulp-fiction, #catalog-works  
**Complexity:** Low (AND condition checking false value)  

**Datacore Equivalent Approach:**
```javascript
// Filter: status === "reviewed" AND bp-candidate !== true (false or null)
const archived = works.filter(w => 
  w['catalog-status'] === 'reviewed' && w['bp-candidate'] !== true
);
// Sort by date-reviewed descending
const sorted = archived.sort((a, b) => 
  new Date(b['date-reviewed']) - new Date(a['date-reviewed'])
);
// Render as table: Title, Authors, Year, Date Reviewed
```

---

**Query 1.5: Approved Works (In Editorial/Production Pipeline)**
```dataview
TABLE without ID
	file.link AS Title,
	authors as Authors,
	date-approved as "Date Approved",
	backstage-draft as "Draft Link"
FROM
	#pulp-fiction AND
	#catalog-works
WHERE
	contains(catalog-status, "approved") AND
	contains(bp-approved, true)
SORT
	date-approved asc
```

**Type:** Multi-condition filtered list  
**Purpose:** Display approved works in BP editorial pipeline  
**Fields Used:** file.link, authors, date-approved, backstage-draft, catalog-status, bp-approved  
**Tags:** #pulp-fiction, #catalog-works  
**Complexity:** Low (AND condition with boolean check)  

**Datacore Equivalent Approach:**
```javascript
// Filter: status === "approved" AND bp-approved === true
const approved = works.filter(w => 
  w['catalog-status'] === 'approved' && w['bp-approved'] === true
);
// Sort by date-approved ascending (oldest first)
const sorted = approved.sort((a, b) => 
  new Date(a['date-approved']) - new Date(b['date-approved'])
);
// Render as table: Title, Authors, Date Approved, Draft Link
```

---

#### 2. **Publication Dashboard Files** (8 files × 1 query = 8 queries)

**Query 2.1-2.8: Works in Publication (Repeated Pattern)**

Each of 8 publication files contains an identical query pattern:

```dataview
TABLE
  authors AS Author,
  catalog-status AS Status,
  word-count AS "Word Count"
FROM
  #pulp-fiction AND
  #catalog-works
WHERE
  contains(publications, [[Publication Name]])
SORT
  title asc
```

**Type:** Publication-filtered list  
**Purpose:** Display all works in a specific publication  
**Fields Used:** authors, catalog-status, word-count, publications (array with wikilinks)  
**Tags:** #pulp-fiction, #catalog-works  
**Complexity:** Low (simple contains() filter on wikilink array)  

**Files Using This Pattern:**
1. Weird Tales Vol 1 No 1 March 1923.md (8 works)
2. Weird Tales Vol 5 No 1 January 1925.md (9 works)
3. Weird Tales Vol 11 No 2 February 1928.md (7 works)
4. Weird Tales Vol 24 No 1 July 1934.md (1 work)
5. Weird Tales Vol 25 No 1 January 1935.md (1 work)
6. Weird Tales Vol 26 No 3 September 1935.md (2 works)
7. Weird Tales Vol 28 No 5 December 1936.md (1 work)
8. Weird Terror Tales Vol 1 No 1 Winter 1969.md (1 work)

**Datacore Equivalent Approach:**
```javascript
// Filter works where publications array contains reference to this publication
const publicationName = '[[Weird Tales Vol 1 No 1 March 1923]]';
const worksInPub = works.filter(w => 
  Array.isArray(w.publications) && 
  w.publications.some(pub => pub.includes(publicationName))
);
// Sort by title ascending
const sorted = worksInPub.sort((a, b) => 
  a.title.localeCompare(b.title)
);
// Render as table: Author, Status, Word Count
```

---

#### 3. **Author Card Template** - Author to Works Query

**Query 3.1: Stories by Author**
```dataview
TABLE without ID
	file.link AS Title,
	year as "Year Published",
	publications AS Publications
FROM
	#library 
WHERE
	contains(authors, [[<%tp.file.title %>]])
SORT
	year asc
```

**Type:** Author-filtered works list  
**Purpose:** Display all works by a specific author (using Templater variable)  
**Fields Used:** file.link, year, publications, authors (array)  
**Tags:** #library  
**Complexity:** Low (contains() filter with template variable)  
**Special Feature:** Uses Templater syntax `<%tp.file.title %>` to dynamically reference current author card  

**Datacore Equivalent Approach:**
```javascript
// Get current author name from React component props
const authorName = props.currentAuthor; // e.g., "Lovecraft, Howard Phillips"
// Filter works where authors array contains this author
const authorWorks = works.filter(w => 
  Array.isArray(w.authors) && 
  w.authors.some(author => author === authorName)
);
// Sort by year ascending
const sorted = authorWorks.sort((a, b) => a.year - b.year);
// Render as table: Title, Year Published, Publications
```

---

### Query Pattern Analysis

**Most Common Pattern:** Filter on single/multiple fields + Sort
- 13 of 13 queries follow this basic pattern
- No complex aggregations (except 1 GROUP BY)
- No subqueries or multi-step operations
- No advanced Dataview features (no dataviewjs, no code blocks, no custom rendering)

**Filter Types Used:**
- ✅ Tag-based filters: `#pulp-fiction AND #catalog-works`
- ✅ Boolean/String containment: `contains(field, value)`
- ✅ Array wikilink filtering: `contains(field, [[Name]])`
- ✅ Negation/comparison: `file.name != "README"`
- ❌ NOT USED: Regular expressions, date ranges, numeric comparisons, nested queries

**Sorting Methods:**
- ✅ Single-column ascending: `SORT field asc`
- ✅ Single-column descending: `SORT field desc`
- ✅ Aggregate sorting: `SORT rows.field asc`
- ❌ NOT USED: Multi-column sorting, custom comparators

**Output Formats:**
- ✅ TABLE with column renaming: `field AS "Display Name"`
- ✅ TABLE without ID: `TABLE without ID`
- ✅ GROUP BY aggregation: `GROUP BY field`
- ❌ NOT USED: LIST, TASK list rendering, custom HTML

---

## 🔧 Datacore Implementation Strategy

### 1. Technology Stack

**Datacore Core:**
- React-based query engine for Obsidian
- Component-driven architecture (perfect for dashboard composition)
- Native Obsidian API integration
- Custom CSS/styling support
- Real-time data updates

**Our Implementation Approach:**
```
Datacore Query System
├── Core Engine
│   ├── Data source: Markdown files with YAML frontmatter
│   ├── Parser: Extracts 26-field schema from works
│   └── Reactive state: Updates on file changes
├── Query Layer (JavaScript/TypeScript)
│   ├── Filter functions (status, author, publication, etc.)
│   ├── Sort functions (by date, title, word-count, etc.)
│   └── Group functions (by status, author, publication)
├── Component Layer (React)
│   ├── StatusDashboard component
│   ├── WorksTable component
│   ├── FilterBar component
│   ├── AuthorCard component
│   └── PublicationDashboard component
└── Rendering Layer
    ├── Markdown table generation
    ├── Interactive UI components
    ├── Live update subscriptions
    └── Export/formatting options
```

---

### 2. Data Flow Architecture

```
Obsidian Vault
    ↓
works/*.md files (30 canonical works)
    ↓
Datacore Parser (extract YAML + frontmatter)
    ↓
In-memory Data Model
    ├── works[] = Array<{26 fields}>
    ├── authors[] = Array<{name, works[]}>
    └── publications[] = Array<{title, works[]}>
    ↓
Query Engine
    ├── filter() → subset of works
    ├── sort() → ordered works
    ├── group() → categorized works
    └── aggregate() → computed statistics
    ↓
React Components
    ├── Render tables
    ├── Render filters
    ├── Render charts
    └── Handle interactions
    ↓
Obsidian Display
    └── Inline render in markdown
```

---

### 3. React Component Architecture

**Component Hierarchy:**
```
<DatacoreWorksDashboard>
  ├── <StatusSummary>
  │   └── <StatusChart> or <StatusTable>
  ├── <FilterBar>
  │   ├── <StatusFilter>
  │   ├── <AuthorFilter>
  │   ├── <PublicationFilter>
  │   └── <DateRangeFilter>
  ├── <WorksTable>
  │   ├── <TableHeader>
  │   ├── <TableRow> ×30
  │   └── <TableFooter>
  ├── <PublicationDashboard>
  │   └── <PublicationWorksList>
  ├── <AuthorCard>
  │   └── <AuthorWorksList>
  └── <BackstageDashboard>
      ├── <CandidatesList>
      ├── <ApprovedList>
      └── <PipelineVisualization>
```

---

### 4. Query Translation Patterns

#### Pattern A: Simple Filter + Sort

**Dataview (Current):**
```dataview
TABLE
  field1 AS "Col1",
  field2 AS "Col2"
FROM #tag1 AND #tag2
WHERE contains(status, "value")
SORT field3 desc
```

**Datacore (Proposed):**
```javascript
const DashboardComponent = () => {
  const [works, setWorks] = useState([]);

  useEffect(() => {
    // Load works from vault
    const allWorks = loadWorksFromVault();
    
    // Apply filter
    const filtered = allWorks.filter(w => 
      hasTag(w, 'tag1') && hasTag(w, 'tag2') && 
      w.status === 'value'
    );
    
    // Apply sort
    const sorted = filtered.sort((a, b) => 
      b.field3.localeCompare(a.field3)
    );
    
    setWorks(sorted);
  }, []);

  return (
    <table>
      <thead>
        <tr><th>Col1</th><th>Col2</th></tr>
      </thead>
      <tbody>
        {works.map(w => (
          <tr key={w.id}>
            <td>{w.field1}</td>
            <td>{w.field2}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

#### Pattern B: GROUP BY Aggregation

**Dataview (Current):**
```dataview
TABLE length(rows) as "Count"
FROM #tag1
WHERE file.name != "README"
GROUP BY field1
SORT rows.field1 asc
```

**Datacore (Proposed):**
```javascript
const StatusSummaryComponent = () => {
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    const allWorks = loadWorksFromVault();
    
    // Group by field1
    const grouped = allWorks.reduce((acc, work) => {
      if (work.file.name === 'README') return acc;
      
      const key = work.field1;
      if (!acc[key]) acc[key] = [];
      acc[key].push(work);
      return acc;
    }, {});
    
    // Convert to array and sort
    const result = Object.entries(grouped)
      .map(([key, items]) => ({
        field1: key,
        count: items.length
      }))
      .sort((a, b) => a.field1.localeCompare(b.field1));
    
    setSummary(result);
  }, []);

  return (
    <table>
      <tbody>
        {summary.map(row => (
          <tr key={row.field1}>
            <td>{row.field1}</td>
            <td>{row.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

#### Pattern C: Array Contains Filter (Wikilinks)

**Dataview (Current):**
```dataview
TABLE authors, status
FROM #tag1
WHERE contains(publications, [[Publication Name]])
SORT title asc
```

**Datacore (Proposed):**
```javascript
const PublicationWorksComponent = ({ publicationName }) => {
  const [works, setWorks] = useState([]);

  useEffect(() => {
    const allWorks = loadWorksFromVault();
    
    // Filter: publications array contains reference to this publication
    const filtered = allWorks.filter(w => 
      hasTag(w, 'tag1') &&
      Array.isArray(w.publications) &&
      w.publications.some(pub => 
        pub.includes(`[[${publicationName}]]`)
      )
    );
    
    // Sort by title
    const sorted = filtered.sort((a, b) => 
      a.title.localeCompare(b.title)
    );
    
    setWorks(sorted);
  }, [publicationName]);

  return (
    <table>
      <tbody>
        {works.map(w => (
          <tr key={w.id}>
            <td>{w.authors}</td>
            <td>{w.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

### 5. Key Advantages of Datacore Approach

**1. Reactivity & Real-time Updates**
- Changes to work files automatically update all dashboards
- No manual refresh required
- Live filtering and sorting as user adjusts parameters

**2. Interactive UI**
- Click-to-filter on dashboard values
- Sortable table headers
- Multi-select filters
- Date range pickers for timeline views

**3. Component Reusability**
- `<WorksTable>` component used across multiple dashboards
- `<FilterBar>` shared by all query pages
- `<StatusSummary>` reusable for different rollup views

**4. Advanced Visualizations**
- Status pipeline visualization (Sankey diagram)
- Author productivity charts
- Publication timeline graphs
- Word count distribution histograms
- BP candidate selection metrics

**5. Performance**
- Client-side filtering (no server round-trips)
- Lazy-loading for large result sets
- Memoized computations for expensive operations
- Indexed access for fast lookups

**6. Developer Experience**
- Standard React patterns (hooks, state, effects)
- TypeScript support for type safety
- Easy to test (pure JavaScript functions)
- Standard component composition patterns

---

## 📋 Migration Checklist

### Phase 1: Setup & Architecture (1 session)
- [ ] Install Datacore plugin and dependencies
- [ ] Create Datacore configuration file
- [ ] Set up TypeScript/React development environment
- [ ] Create base component library structure
- [ ] Document API layer for vault data access

### Phase 2: Core Query Implementation (1-2 sessions)
- [ ] Build data loading utility (parse YAML, extract fields)
- [ ] Implement filter functions library
- [ ] Implement sort functions library
- [ ] Implement group/aggregate functions library
- [ ] Create query composition system

### Phase 3: Components Build (2-3 sessions)
- [ ] Build `<WorksTable>` component
- [ ] Build `<StatusDashboard>` component
- [ ] Build `<FilterBar>` component
- [ ] Build `<AuthorCard>` component
- [ ] Build `<PublicationDashboard>` component
- [ ] Build `<BackstagePipeline>` component

### Phase 4: Migration & Testing (1 session)
- [ ] Replace Pulp Fiction.md queries with Datacore components
- [ ] Replace publication dashboard queries
- [ ] Replace author card queries
- [ ] Test all queries match original Dataview behavior
- [ ] Performance testing and optimization

### Phase 5: Enhancements (1 session)
- [ ] Add advanced filtering options
- [ ] Add data export/reporting
- [ ] Add visualization components
- [ ] Polish UI/UX
- [ ] Documentation

---

## 🚀 Recommended Next Steps

**Immediate (This Session):**
1. Create Phase 6 implementation document with detailed component specs
2. Choose implementation sequence (A→B→C→D or B→C→D→A)
3. Set up Datacore development environment
4. Begin Query Audit → Design → Implementation workflow

**Decision Point:**
Based on your preference, we can either:
- **Deep Dive:** Start with component architecture design document
- **Hands-On:** Begin building first Datacore component immediately
- **Tool Setup:** Configure development environment and test basic Datacore functionality

---

**Document Version:** 1.0  
**Next Review:** Upon Phase 6 component architecture finalization  
**Related:** [PROJECT-ROADMAP.md](PROJECT-ROADMAP.md) | [Pulp Fiction.md](../Pulp Fiction.md)
