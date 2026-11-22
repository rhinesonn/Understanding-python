export type AdmonitionKind = 'note' | 'tip' | 'warning' | 'syllabus';

export interface AdmonitionBlock {
  kind: AdmonitionKind;
  title: string;
  body: string;
}

export interface ComparisonTable {
  id: string;
  title: string;
  headers: string[];
  rows: string[][];
  footnote?: string;
}

export interface OverviewSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  table?: ComparisonTable;
  admonition?: AdmonitionBlock;
}

export interface UnitMeta {
  topicId: string;
  slug: string;
  unitLabel: string;
  shortTitle: string;
  group: 'Basic' | 'Intermediate' | 'Advanced';
  learningObjectives: string[];
  introParagraphs: string[];
  referenceTable?: ComparisonTable;
  admonitions: AdmonitionBlock[];
}

export const OVERVIEW_UNIT = {
  slug: '00-overview',
  unitLabel: 'Unit 00',
  title: 'Overview & CS1010A Syllabus',
  subtitle:
    'Course roadmap, mental models, assessment structure, and strict syllabus boundaries for NUS CS1010A Programming Methodology.',
  learningObjectives: [
    'Understand the three-tier CS1010A Road Map (Basic, Intermediate, and Advanced concepts) across Lectures 1–12.',
    'Explain how functional abstraction, data abstraction, and object-oriented programming manage program complexity.',
    'Know the exact scope, rules, and allowed materials for the Midterm, Practical Exam (PE), and Final Exam.',
    'Identify topics explicitly excluded from PE and Final Exam testing so you focus your revision effectively.',
  ],
  sections: [
    {
      id: 'what-is-cs1010a',
      title: 'What Is CS1010A Really About?',
      paragraphs: [
        'CS1010A (Programming Methodology) is not primarily a course about memorizing Python syntax. Python is simply the vehicle used to teach how to break complex problems into clean, composable abstractions, reason rigorously about computational processes (Time and Space Order of Growth), and choose appropriate data structures and paradigms.',
        'Throughout the semester, you progress through multiple programming paradigms in Python: functional thinking (wishful thinking, recursion, higher-order functions, signal-processing pipelines), imperative state and mutation (lists, aliasing, dictionaries, files), and object-oriented programming (encapsulation, inheritance, polymorphism, and MRO).',
      ],
      admonition: {
        kind: 'tip',
        title: 'How to Use These Notes',
        body: 'Each unit follows the NUS online textbook format: start with the Learning Objectives, read through the worked lecture examples and tables, interact with the embedded visualizers, test your intuition on Common Exam Traps, and finish with the Self-Check Practice questions at the bottom. Press `/` or `⌘K` anytime to search across all units.',
      },
    },
    {
      id: 'roadmap',
      title: 'The CS1010A Course Road Map (Lecture 12)',
      paragraphs: [
        'Lecture 12 organizes the entire semester into three progressive tiers. Every unit in the left sidebar maps directly to this official roadmap:',
      ],
      table: {
        id: 'roadmap-table',
        title: 'CS1010A Syllabus Roadmap (Lectures 1–12)',
        headers: ['Tier', 'Units', 'Core Lecture Concepts'],
        rows: [
          [
            'Basic',
            'Units 01–02',
            'Expressions, Functional Abstraction, Wishful Thinking, Scope, Recursion, Iteration, Order of Growth (O/Ω/Θ)',
          ],
          [
            'Intermediate',
            'Units 03–06',
            'Higher-Order Functions & Closures, Data Abstraction & Abstraction Barriers, Tuples/Trees/Files, Lists & Mutation, Searching & Sorting, Dictionaries, Multiple Representations (Multisets) & Data Pivoting',
          ],
          [
            'Advanced',
            'Units 07–08',
            'Object-Oriented Programming (Encapsulation, Inheritance, Polymorphism, Diamond MRO) & Exception Handling',
          ],
        ],
      },
    },
    {
      id: 'assessment',
      title: 'Assessment Weightage & Exam Rules',
      paragraphs: [
        'Knowing the exact exam structure and constraints prevents costly mistakes during the Practical Exam and Finals. Note the progressive scoring policy: if your Final Exam percentage exceeds your Midterm percentage, the Final absorbs the Midterm weight (65% total).',
      ],
      table: {
        id: 'assessment-table',
        title: 'CS1010A Assessment Overview (Lectures 6, 7, 11, 12)',
        headers: ['Component', 'Weight', 'Format & Allowed Materials', 'Scope & Focus'],
        rows: [
          [
            'Coursemology',
            '15%',
            'Continuous missions, trainings, tutorials & recitations',
            'All weekly topics',
          ],
          [
            'Midterm',
            '20%',
            'Written exam • 1× A4 helpsheet',
            'Up to & including Lecture 6: Expressions, Recursion/Iteration & OOG, HOFs, Data Abstraction (ADT)',
          ],
          [
            'Practical Exam (PE)',
            '20%',
            '90 mins • Open book (hardcopy + Coursemology) • GLIDE IDLE • 5 Run attempts',
            '3 Qs: Q1 General Problem Solving (Rec/Iter), Q2 Data Processing (Files/Dicts/Pivoting), Q3 OOP',
          ],
          [
            'Final Exam',
            '45% (up to 65%)',
            '2 hours • 90 marks • 2× double-sided A4 helpsheets',
            'Cumulative (Lectures 1–10 & 12 concepts)',
          ],
        ],
      },
    },
    {
      id: 'syllabus-boundaries',
      title: 'Strict Syllabus Boundaries (What NOT to Use or Over-Study)',
      paragraphs: [
        'Many generic online Python guides introduce tools or algorithms that are outside the CS1010A syllabus or disallowed in exams. These notes stay strictly inside what your CS1010A lectures actually teach and test:',
      ],
      bullets: [
        '**Memoization & Dynamic Programming (Lecture 10)**: Explicitly marked **"Won\'t come out on PE/Finals"** on Lecture 12 Slide 32. Included in Unit 08 only as a clearly labelled non-examinable reference.',
        '**External Data Libraries (Lecture 11)**: NumPy, Pandas, Matplotlib, and Seaborn are shown for visualisation awareness only and **cannot be used in the Practical Exam (PE)** — PE Q2 must be solved in pure Python.',
        '**Sorting Algorithms (Lecture 7)**: Only **Linear Search**, **Binary Search** (non-slicing index helper), **Selection Sort** (Lecture 7\'s out-of-place, stable version), **Merge Sort**, and built-in `lst.sort()` / `sorted()` are in syllabus (Insertion Sort and Quick Sort are not taught).',
        '**Deep Copying (Lecture 7)**: `copy.deepcopy` is not taught in Lecture 7; instead know shallow `lst.copy()` (`s[2] is t[2]`), recursive `copy_tree` (Lecture 6), and list comprehensions `[[0]*c for _ in range(r)]`.',
      ],
      admonition: {
        kind: 'syllabus',
        title: 'Note on Lectures 1 & 5',
        body: 'Lectures 2, 3, 4, 6, 7, 8, 9, 10, 11, and 12 are covered directly from your uploaded slide decks, along with the Lecture 1 (expressions, conditionals) and Lecture 5 (Data Abstraction Barrier, Constructors/Selectors/Predicates/Printers, `==` vs `is`) foundations recapped in Lectures 6 and 12.',
      },
    },
  ] as OverviewSection[],
};

export const UNIT_META: Record<string, UnitMeta> = {
  'abstraction-scope': {
    topicId: 'abstraction-scope',
    slug: '01-abstraction-scope',
    unitLabel: 'Unit 01',
    shortTitle: '01. Functional Abstraction & Scope',
    group: 'Basic',
    learningObjectives: [
      'Trace Python expressions accurately, including short-circuiting `and`/`or` return values and `return` vs. side effects (`print`/`show`).',
      'Explain functional abstraction as a black box separating specification (WHAT) from implementation (HOW), and recall the 7 properties of a good abstraction.',
      'Apply top-down design ("wishful thinking"), block structure (nested helpers), and named constants to avoid magic numbers (`taxi_fare`, `runes.py`).',
      'Distinguish bound vs. free variables, predict `UnboundLocalError` vs. mutating an outer list element (`y[0] += 1`), and avoid the mutable default argument trap.',
    ],
    introParagraphs: [
      'A central theme of CS1010A is **abstraction**: giving a meaningful name to a computational pattern so you can reason about *what* it does without keeping track of *how* it works internally. Lecture 2 introduces this through both numerical functions (`square`, `hypotenuse`, Comfort Delgro `taxi_fare`) and the visual Picture Language (`runes.py`).',
      'Understanding how Python resolves variable names — bound parameters vs. free variables, block structure, local assignment shadowing, and static default arguments (Lectures 2 & 9) — is essential to prevent subtle bugs that frequently appear in Midterm Q1 and PE Q3.',
    ],
    referenceTable: {
      id: 'good-abstraction-table',
      title: '7 Properties of a Good Functional Abstraction (Lecture 2)',
      headers: ['#', 'Property', 'Lecture 2 Example'],
      rows: [
        ['1', 'Breaks problems into natural subtasks (divide & conquer)', '`hypotenuse` → `sum_of_squares` → `square`'],
        ['2', 'Makes programs easier to read & understand', 'Named helpers + avoiding magic numbers in `taxi_fare`'],
        ['3', 'Captures common patterns', '`repeat_pattern`, `stackn`, `nxn`'],
        ['4', 'Enables code reuse', '`square` reused in `sum_of_squares` & `circle_area`'],
        ['5', 'Hides irrelevant implementation details', 'Callers use `beside` without worrying about rotations'],
        ['6', 'Separates specification (WHAT) from implementation (HOW)', '`square(x)` as `x * x` vs `exp(2 * log(x))`'],
        ['7', 'Makes debugging and modification easier', 'Changing `block1` or `increment` in one place'],
      ],
    },
    admonitions: [
      {
        kind: 'note',
        title: 'Runes Picture Language Depth Map (Lecture 2)',
        body: 'In `runes.py`, 3D overlays use a greyscale depth map where **Black = nearest** and **White = furthest**, enabling stereograms and red/blue anaglyphs.',
      },
      {
        kind: 'warning',
        title: 'Quirk of Python: `nonlocal` (Lecture 9)',
        body: 'Lecture 9 mentions `nonlocal x` as "a quirk of Python, for knowledge only" to rebind an enclosing function\'s variable. For exams, remember the core rule: ANY assignment (`=`, `+=`) to `x` inside a function makes `x` local across the entire function body.',
      },
    ],
  },

  'recursion-growth': {
    topicId: 'recursion-growth',
    slug: '02-recursion-growth',
    unitLabel: 'Unit 02',
    shortTitle: '02. Recursion, Iteration & Growth',
    group: 'Basic',
    learningObjectives: [
      'Design linear, tree, and mutual recursive functions with complete base cases and valid reductions toward termination.',
      'Distinguish a recursive process (deferred operations on the call stack) from an iterative process (state captured in variables, constant space).',
      'Apply logarithmic divide-and-conquer (`fast_expt`, Euclid\'s `gcd`) and disjoint-set splitting (Counting Change `cc`).',
      'Analyze Time and Space Order of Growth using `O`, `Ω`, and `Θ` notation, dropping constants, lower-order terms, and logarithm bases.',
    ],
    introParagraphs: [
      'Recursion solves a problem by reducing it to smaller instances of the exact same problem (like reducing an `n×n` 15-puzzle step-by-step down to `2×2`). Every valid recursive function mirrors mathematical induction: it needs terminating **base case(s)** and **recursive step(s)** guaranteed to reach a base case.',
      'Crucially, **two functions that compute the exact same answer can consume wildly different Time and Space**. Order of Growth (`O`, `Ω`, `Θ`) lets us compare algorithms independent of hardware speed by focusing on how resource consumption `R(n)` scales as `n` grows large.',
    ],
    referenceTable: {
      id: 'lec3-complexity-table',
      title: 'Canonical Lecture 3–4 Time & Space Complexities',
      headers: ['Function', 'Process Type', 'Time Complexity', 'Space Complexity'],
      rows: [
        ['`fact_rec(n)`', 'Linear recursive (deferred `*`)', '`O(n)`', '`O(n)`'],
        ['`fact_iter(n)`', 'Iterative (`product, counter`)', '`O(n)`', '`O(1)`'],
        ['`fib(n)` (naive)', 'Tree recursive (`fib(n+1)` leaves)', '`O(Φⁿ)` (`Φ ≈ 1.618`)', '`O(n)` (tree depth)'],
        ['`power(b, e)`', 'Linear recursive', '`O(e)`', '`O(e)`'],
        ['`fast_expt(b, e)`', 'Halving recursive `(b²)^(e/2)`', '`O(log e)`', '`O(log e)`'],
        ['`cc(a, k)`', 'Tree recursive (2 disjoint sets)', '`O(2ᵃ)`', '`O(a)` (`L = a + k`)'],
      ],
      footnote: 'At 10⁹ operations/sec, 2⁵⁹ steps takes roughly 13.7 billion years (age of the universe) — showing why exponential algorithms become unusable even for modest `n`.',
    },
    admonitions: [
      {
        kind: 'note',
        title: 'Stack vs. Heap in PythonTutor (Lecture 4)',
        body: 'When tracing Space complexity, remember that active function call frames live on the **Stack** (depth of pending calls), while created data objects (tuples, lists, closures) live on the **Heap**.',
      },
    ],
  },

  hof: {
    topicId: 'hof',
    slug: '03-hof',
    unitLabel: 'Unit 03',
    shortTitle: '03. Higher-Order Functions',
    group: 'Intermediate',
    learningObjectives: [
      'Treat functions as first-class objects: assign them to variables, pass them as arguments, and return them as results.',
      'Abstract repetitive summation, product, and accumulation patterns using `sum`, `integral`, `fold`, and `fold2`.',
      'Trace closures (functions capturing variables from enclosing frames) and curried/returned functions (`make_x`, `deriv`, `newtons_method`, `repeat_pattern`).',
      'Use the variadic `*` operator (`def f(x, y, *z):` and `fn(*args)`) to accept and unpack variable-length arguments.',
    ],
    introParagraphs: [
      'Up to Unit 02, functions only took numbers or pictures as inputs and returned values. **Higher-Order Functions (HOFs)** lift abstraction one level higher: they take *other functions as arguments* or *return new functions as results*.',
      'In Lecture 4, we observe that `sum_integers`, `sum_cubes`, and `pi_sum` share the exact same skeleton — differing only in `term(a)` and `next(a)`. By passing functions as parameters, one template solves them all, and even computes numerical integrals (`integral`) and roots via Newton\'s Method (`newtons_method`).',
    ],
    referenceTable: {
      id: 'hof-patterns-table',
      title: 'Core Lecture 4 Higher-Order Patterns',
      headers: ['HOF', 'Inputs', 'Returns', 'Key Idea'],
      rows: [
        ['`sum_series(term, a, next, b)`', '2 functions + bounds', 'Number', 'Generalizes any finite series summation'],
        ['`integral(f, a, b, dx)`', 'Function `f` + bounds', 'Number', 'Inner `add_dx` forms a **closure** capturing `dx`'],
        ['`make_x(x)`', 'Value `x`', 'Function `() -> x`', '`five` is a function object; `five()` returns `5`'],
        ['`deriv(g)`', 'Function `g`', 'Function `g\'`', 'Numerical derivative `(g(x+dx) - g(x)) / dx`'],
        ['`newtons_method(g, guess)`', 'Function `g` + guess', 'Root `x` (`g(x)≈0`)', 'Combines `deriv`, `improve`, and recursive `attempt`'],
        ['`fold2(op, term, a, next, b, base)`', '3 functions + bounds + base', 'Combined value', 'Unifies `sum` (`+`, `0`) and `product` (`*`, `1`)'],
      ],
    },
    admonitions: [
      {
        kind: 'tip',
        title: 'Exam Tracing Tip: Always Track Return Types',
        body: 'When reading expressions like `twice(twice)(inc)(5)` or `deriv(cube)(5)`, evaluate strictly left-to-right and write down the type after each pair of parentheses: is it a **function** waiting for another call, or a final **value**?',
      },
    ],
  },

  'sequences-trees': {
    topicId: 'sequences-trees',
    slug: '04-sequences-trees',
    unitLabel: 'Unit 04',
    shortTitle: '04. Data Abstraction, Trees & Files',
    group: 'Intermediate',
    learningObjectives: [
      'Design Abstract Data Types (ADTs) using Constructors, Selectors, Predicates, and Printers without violating the Data Abstraction Barrier.',
      'Distinguish equivalence (`==`) from object identity (`is`), and construct single-element tuples `(x,)` safely.',
      'Analyze the hidden `O(n²)` cost of tuple concatenation/slicing and why recursive tuple `reverse` uses `O(n²)` Space while iterative uses `O(n)` Space.',
      'Process nested tuple trees and compose Signal-Processing pipelines (`enumerate → filter → map → accumulate`), accounting for one-time-use built-in iterators.',
      'Read and write text files using `open`, `readline()`, EOF sentinel `""`, and `write()`.',
    ],
    introParagraphs: [
      'Just as Functional Abstraction hides *how a procedure computes*, **Data Abstraction** (Lecture 5) hides *how compound data is represented*. Higher-level operations like `add_rat` talk to the underlying representation exclusively through Constructors (`make_rat`) and Selectors (`numer`, `denom`), forming a strict **Abstraction Barrier**.',
      'Lecture 6 builds on immutable sequences (`tuple`) to represent hierarchical **trees** (via the closure property: tuples containing tuples), introduces the **Signal-Processing View** of sequence computation, and covers **File I/O** — the foundation of Practical Exam Q2.',
    ],
    referenceTable: {
      id: 'seq-complexity-table',
      title: 'Tuple Processing & ADT Summary (Lectures 5–6)',
      headers: ['Operation / Concept', 'Behaviour / Complexity', 'Critical Exam Detail'],
      rows: [
        ['`t1 + t2`', '`O(len(t1) + len(t2))`', 'Creates a brand-new tuple copying both operands'],
        ['Recursive tuple `reverse` / `scale_seq`', 'Time `O(n²)`, Space `O(n²)`', 'Holds `n` slices `seq[1:]` alive on the heap simultaneously'],
        ['Iterative tuple `reverse` / `scale_seq`', 'Time `O(n²)`, Space `O(n)`', 'Still copies tuple each step, but only keeps 1 result tuple'],
        ['`map(fn, seq)` / `filter(pred, seq)`', 'Lazy one-time iterable', 'Exhausted after 1st `tuple(...)` or `for` loop!'],
        ['`f.readline()` EOF check', 'Returns `""` at EOF', 'Blank lines return `"\\n"` (truthy), NOT `""`!'],
      ],
    },
    admonitions: [
      {
        kind: 'warning',
        title: 'Do Not Cross the Abstraction Barrier!',
        body: 'In Midterm Data Abstraction questions, writing `r[0]` directly inside `add_rat(x, y)` instead of `numer(r)` loses marks even if it returns the right number — because your code breaks if the internal representation changes from a tuple to a dict or list.',
      },
    ],
  },

  'lists-search-sort': {
    topicId: 'lists-search-sort',
    slug: '05-lists-search-sort',
    unitLabel: 'Unit 05',
    shortTitle: '05. Lists, Mutation, Search & Sort',
    group: 'Intermediate',
    learningObjectives: [
      'Differentiate mutating list methods returning `None` (`append`, `extend`, `insert`, `remove`, `clear`, `reverse`, `sort`) from `pop(pos)` and the `del` statement.',
      'Trace box-and-pointer memory diagrams for aliasing, shallow `copy()`, `[[0]*c]*r` pitfalls, and why `+=` differs from `= +` on lists vs. tuples.',
      'Implement Linear Search (`O(n)`) and non-slicing Binary Search (`O(log n)`), explaining why slicing destroys `O(log n)` complexity.',
      'Compare Lecture 7\'s Selection Sort, Merge Sort, and Python\'s built-in `lst.sort(key=, reverse=)` across Time, In-place status, and Stability.',
    ],
    introParagraphs: [
      'Lecture 7 introduces **mutation** via Python\'s `list` type. Mutable objects make in-place updates fast (appending is `O(1)` amortized instead of `O(n)` tuple copying), but introduce **aliasing**: two variables pointing to the same list object will both observe any in-place mutation.',
      'We then apply lists to two classic algorithmic tasks: **Searching** (Linear vs. Binary Search) and **Sorting** (Selection Sort, Merge Sort, and Python\'s built-in Timsort). Pay close attention to the exact Lecture 7 implementations — in CS1010A, Selection Sort builds a new list with strict `<`, making it **stable and NOT in-place**!',
    ],
    referenceTable: {
      id: 'lec7-sorting-table',
      title: 'Lecture 7 Searching & Sorting Complexity Table (Strict Syllabus)',
      headers: ['Algorithm (L7 Version)', 'Best', 'Average', 'Worst', 'In-Place?', 'Stable?'],
      rows: [
        ['Linear Search', '`O(1)`', '`O(n)`', '`O(n)`', '—', '—'],
        ['Binary Search (`low`/`high`, sorted)', '`O(1)`', '`O(log n)`', '`O(log n)`', '—', '—'],
        ['Selection Sort (`new = []`, `<`)', '`O(n²)`', '`O(n²)`', '`O(n²)`', '**No**', '**Yes**'],
        ['Merge Sort (`merge`, `<=`)', '`O(n log n)`', '`O(n log n)`', '`O(n log n)`', '**No**', '**Yes**'],
        ['`lst.sort(key=, reverse=)`', '`O(n)` / `O(n log n)`', '`O(n log n)`', '`O(n log n)`', '**Yes**', '**Yes**'],
      ],
      footnote: 'Note: Insertion Sort and Quick Sort are NOT in the CS1010A Lecture 7 syllabus. `sorted(seq)` is also stable `O(n log n)` and returns a new list (not in-place).',
    },
    admonitions: [
      {
        kind: 'note',
        title: '`del` Is a Statement, Not a Function',
        body: '`del a[0]` has NO parentheses and returns NOTHING (not even `None`) — writing `b = del a[0]` is a `SyntaxError`. `del a[:]` empties the list in-place (visible to aliases), while `del a` only removes the variable name `a` (the list survives if another variable `b` still references it).',
      },
    ],
  },

  'dicts-ds-pivoting': {
    topicId: 'dicts-ds-pivoting',
    slug: '06-dicts-ds-pivoting',
    unitLabel: 'Unit 06',
    shortTitle: '06. Dicts, Data Structures & Pivoting',
    group: 'Intermediate',
    learningObjectives: [
      'Use Python dictionaries (`{}`, `d[k]`, `d.get`, `k in d`, `del`, `.items()`) and choose effectively between Tuples, Lists, and Dictionaries.',
      'Separate a Data Structure\'s Specification from its Implementation and representation constraints (Game of Nim & LIFO Stack).',
      'Compare all four Lecture 8 Multiset representations (Unordered List, Ordered List, BST, Dictionary) across `adjoin_mset`, `multiplicity_of`, and `intersection_of`.',
      'Apply Lecture 11 pure-Python data-wrangling techniques (wide vs. long form, dict-of-dicts pivoting, binning, `delta`, `mavg`, `zip(*rows)`, Top-K with ties) for PE Q2.',
    ],
    introParagraphs: [
      'In Lecture 8, we examine a profound principle of software engineering: **the exact same Abstract Data Type can have multiple valid implementations with dramatically different performance trade-offs**. Using the **Multiset (Bag)** ADT, we compare Unordered Lists, Ordered Lists, Binary Search Trees, and Python Dictionaries side-by-side.',
      'Combining dictionaries with Lecture 11\'s data-reshaping patterns — pivoting long-form records into `dict`-of-`dicts` or `dict`-of-`lists`, computing moving averages (`mavg`), daily differences (`delta`), histograms, and Top-K rankings with ties — equips you directly for **Practical Exam Question 2**.',
    ],
    referenceTable: {
      id: 'tuple-list-dict-table',
      title: 'Tuple vs. List vs. Dictionary Comparison (Lectures 6–8)',
      headers: ['Property', 'Tuple `()`', 'List `[]`', 'Dictionary `{}`'],
      rows: [
        ['Mutable?', 'No (immutable)', 'Yes', 'Yes (keys must be immutable/hashable)'],
        ['Ordered / Indexed?', 'Yes (`0..n-1`)', 'Yes (`0..n-1`)', 'Key-based lookup (`d[k]`)'],
        ['`x in seq`', '`O(n)` (elements)', '`O(n)` (elements)', '`O(1)` (**KEYS only**, not values!)'],
        ['Best used for', 'Fixed records, tree nodes, dict keys', 'Ordered mutable collections, stacks', 'Fast lookup, counting, grouping, pivoting'],
      ],
    },
    admonitions: [
      {
        kind: 'syllabus',
        title: 'Practical Exam Rule (Lecture 11 Slide 67)',
        body: 'Lecture 11 showcases `matplotlib`, `numpy`, `pandas`, and `seaborn` to illustrate real-world data visualisation, **but explicitly states these external libraries CANNOT be used in the Practical Exam (PE)**. Practice all Q2 pivoting, filtering, and aggregation in pure Python.',
      },
    ],
  },

  oop: {
    topicId: 'oop',
    slug: '07-oop',
    unitLabel: 'Unit 07',
    shortTitle: '07. Object-Oriented Programming',
    group: 'Advanced',
    learningObjectives: [
      'Explain the 4 pillars of OOP (Encapsulation, Data Abstraction, Inheritance, Polymorphism) and why OOP avoids procedural tuple-state bugs (`BankAccount`).',
      'Design class hierarchies with `__init__`, `self`, and `super()` without passing `self` twice or using mutable default arguments.',
      'Predict `isinstance(obj, Cls)` vs. `type(obj) == Cls` across multi-level inheritance hierarchies (Star Trek / Vehicles).',
      'Trace dynamic `self` method dispatch (`Lecturer.lecture` calling `ArrogantLecturer.say`) and Multiple / Diamond Inheritance Method Resolution Order (`SingingArrogantLecturer`).',
    ],
    introParagraphs: [
      'Lecture 9 introduces **Object-Oriented Programming (OOP)** — a paradigm where data (attributes) and the operations that act on that data (methods) are bundled inside objects instantiated from class blueprints. Python is a multi-paradigm language (supporting Imperative, Functional, and OOP styles), and Practical Exam Question 3 is dedicated to OOP design.',
      'The most frequently tested OOP subtleties in CS1010A are **dynamic `self` dispatch** (a superclass method calling `self.method()` executes the subclass\'s override!) and **Diamond Inheritance MRO** (`super()` follows the concrete instance\'s Method Resolution Order so all subclasses\' methods execute before any shared superclass).',
    ],
    referenceTable: {
      id: 'oop-pillars-table',
      title: 'The 4 Core OOP Principles & Python Mechanics (Lecture 9)',
      headers: ['Concept', 'Meaning', 'Lecture 9 Example'],
      rows: [
        ['Encapsulation', 'Bundle state + methods together inside one object', '`BankAccount` holding `self.balance` + `deposit`/`withdraw`'],
        ['Data Abstraction', 'Interact via public methods, hiding internal fields', 'Calling `acc.withdraw(30)` instead of mutating internals'],
        ['Inheritance (`is-a`)', 'Subclass reuses & extends superclass behaviour', '`NamedObject → MobileObject → Ship → EnemyShip`'],
        ['Polymorphism', 'Same method call adapts to the concrete object\'s class', '`Lecturer.lecture` calling `self.say()` → `ArrogantLecturer.say`'],
        ['Diamond MRO', 'All subclasses run before a shared superclass', '`SingingArrogantLecturer(ArrogantLecturer, Singer)` with `Singer(Speaker)`'],
      ],
    },
    admonitions: [
      {
        kind: 'tip',
        title: 'How to Read `super()` in Any Exam Question',
        body: 'Never translate `super()` as "my parent class". Always translate `super()` as **"the next class after me in `self`\'s MRO"**. That single mental shift makes every Diamond Inheritance question crystal clear.',
      },
    ],
  },

  exceptions: {
    topicId: 'exceptions',
    slug: '08-exceptions',
    unitLabel: 'Unit 08',
    shortTitle: '08. Exceptions & Syllabus Scope',
    group: 'Advanced',
    learningObjectives: [
      'Distinguish Syntax Errors (caught before execution) from runtime Exceptions (`ZeroDivisionError`, `NameError`, `TypeError`, `ValueError`, `KeyError`, `IndexError`).',
      'Trace the exact execution order of `try`, `except`, `else`, and `finally` — including when an uncaught exception occurs (`divide_test("2", "1")`).',
      'Raise exceptions explicitly with `raise` and create custom exception subclasses inheriting from `Exception` (`MyError`).',
      'Recognize Lecture 10\'s Memoization and Dynamic Programming concepts while noting Lecture 12\'s explicit confirmation that they will NOT appear on PE or Finals.',
    ],
    introParagraphs: [
      'Real programs encounter invalid user input, missing files, and division by zero. **Exception handling** (Lecture 10) separates normal program logic from error-recovery logic using `try / except / else / finally` blocks instead of cluttering every function with nested `if` checks.',
      'This unit also records the official **Lecture 12 Slide 32 syllabus clarification** regarding Memoization and Dynamic Programming so your exam revision stays laser-focused on examinable material.',
    ],
    referenceTable: {
      id: 'exception-clauses-table',
      title: '`try / except / else / finally` Execution Matrix (Lecture 10)',
      headers: ['Outcome inside `try:`', '`except` runs?', '`else` runs?', '`finally` runs?', 'Propagates error?'],
      rows: [
        ['No exception raised (`divide_test(2, 1)`)', 'No', '**Yes**', '**Yes**', 'No'],
        ['Matching exception raised (`divide_test(2, 0)`)', '**Yes**', '**No**', '**Yes**', 'No'],
        ['Uncaught exception raised (`divide_test("2", "1")`)', 'No', '**No**', '**Yes (FIRST!)**', '**Yes (after `finally`)**'],
      ],
    },
    admonitions: [
      {
        kind: 'syllabus',
        title: 'Lecture 12 Slide 32: Memoization & DP Not Tested on PE/Finals',
        body: 'Although Lecture 10 introduces Memoization (`memo_fib`, `memoize(fn)`) and bottom-up Dynamic Programming (`dp_choose`, Chocolate Packing, `dp_prime`), **Lecture 12 explicitly states: "Memoization & Dynamic Programming — Won\'t come out on PE/Finals."** Example 4 below is provided purely for conceptual reference.',
      },
    ],
  },
};

export interface NavGroup {
  label: string;
  items: { slug: string; title: string; topicId?: string }[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Getting Started',
    items: [{ slug: '00-overview', title: '00. Overview & Syllabus' }],
  },
  {
    label: 'Basic: Foundations & Processes',
    items: [
      {
        slug: '01-abstraction-scope',
        title: '01. Functional Abstraction & Scope',
        topicId: 'abstraction-scope',
      },
      {
        slug: '02-recursion-growth',
        title: '02. Recursion, Iteration & Growth',
        topicId: 'recursion-growth',
      },
    ],
  },
  {
    label: 'Intermediate: Abstraction & Data',
    items: [
      { slug: '03-hof', title: '03. Higher-Order Functions', topicId: 'hof' },
      {
        slug: '04-sequences-trees',
        title: '04. Data Abstraction, Trees & Files',
        topicId: 'sequences-trees',
      },
      {
        slug: '05-lists-search-sort',
        title: '05. Lists, Mutation, Search & Sort',
        topicId: 'lists-search-sort',
      },
      {
        slug: '06-dicts-ds-pivoting',
        title: '06. Dicts, Data Structures & Pivoting',
        topicId: 'dicts-ds-pivoting',
      },
    ],
  },
  {
    label: 'Advanced: OOP & Exceptions',
    items: [
      { slug: '07-oop', title: '07. Object-Oriented Programming', topicId: 'oop' },
      {
        slug: '08-exceptions',
        title: '08. Exceptions & Syllabus Scope',
        topicId: 'exceptions',
      },
    ],
  },
  {
    label: 'Exam Guides',
    items: [{ slug: 'a4-helpsheet', title: 'A4. Printable Exam Helpsheet' }],
  },
];

export const ORDERED_SLUGS: { slug: string; title: string }[] = NAV_GROUPS.flatMap(
  (g) => g.items.map((item) => ({ slug: item.slug, title: item.title }))
);
