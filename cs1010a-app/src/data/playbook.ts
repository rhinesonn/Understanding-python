export interface BlueprintStep {
  step: number;
  title: string;
  askYourself: string;
  action: string;
  watchOut?: string;
}

export interface WritingBlueprint {
  id: string;
  label: string;
  lectureRef: string;
  whenToUse: string;
  steps: BlueprintStep[];
  skeleton: string;
  workedProblem: string;
  workedThoughtProcess: string[];
  workedSolution: string;
}

export interface PaperMethod {
  id: string;
  title: string;
  bestFor: string;
  howToDraw: string;
  goldenRule: string;
}

export interface TraceStep {
  lineIdx: number; // 0-based line in codeLines
  action: string;
  scratchpad: string;
  outputSoFar?: string;
  checkpointQuestion?: string;
  checkpointAnswer?: string;
}

export interface GuidedTraceDrill {
  id: string;
  title: string;
  topicTag: string;
  methodUsed: string;
  codeLines: string[];
  steps: TraceStep[];
  finalTakeaway: string;
}

export interface ExamChecklistItem {
  id: string;
  category: string;
  check: string;
}

export const WRITING_BLUEPRINTS: WritingBlueprint[] = [
  {
    id: 'recursion',
    label: 'Recursion & Trees',
    lectureRef: 'Lectures 3, 4 & 6',
    whenToUse:
      'Problem is defined in terms of smaller versions of itself (numbers `n`, nested tuple trees, counting combinations, halving `n // 2`).',
    steps: [
      {
        step: 1,
        title: 'Write 3 Tiny Input → Output Examples',
        askYourself: 'What should my function return on the smallest possible inputs?',
        action:
          'Before writing `def`, jot down an empty/zero case, a 1-item case, and a small compound case (e.g., `()`, `5`, `(1, (2, 3))`).',
      },
      {
        step: 2,
        title: 'Lock Down ALL Base Cases First',
        askYourself: 'How can the recursion stop — and can it overshoot?',
        action:
          'Write every terminating case: `n == 0` (and `n == 1` if stepping by `n - 2`), `amount < 0 or kinds == 0`, `tree == ()`, `is_leaf(tree)` (`type(tree) != tuple`).',
        watchOut: 'Missing `amount < 0` or `tree == ()` causes infinite recursion (`RecursionError`).',
      },
      {
        step: 3,
        title: 'Use Wishful Thinking ("Trust the Recursive Call")',
        askYourself: 'If `f(smaller)` ALREADY gives the exact right answer, how do I build `f(whole)`?',
        action:
          'Do NOT trace 5 levels deep while designing! Assume `f(n - 1)` or `f(tree[1:])` works magically, and write the 1 combining step.',
      },
      {
        step: 4,
        title: 'Verify Your Reduction Shrinks Every Branch',
        askYourself: 'Is every recursive call strictly closer to a base case?',
        action:
          'Check: linear (`n - 1` or `seq[1:]`), logarithmic (`e // 2` called ONCE, not twice!), or disjoint split (`cc(a, k-1) + cc(a - coin, k)`).',
      },
      {
        step: 5,
        title: 'Dry-Run Base + 1 Step & Check Hidden Complexity',
        askYourself: 'Did I accidentally turn `O(log n)` into `O(n)` or `O(n)` into `O(n²)`?',
        action:
          'Trace your smallest non-base case line by line. Never call `fast_expt(b, e//2)` twice; remember `tuple1 + tuple2` costs `O(len)`.',
      },
    ],
    skeleton: `def solve(x):
    # 1. Base case(s): smallest input / empty / overshoot
    if <empty or zero condition>:
        return <base value>
    elif <leaf / single-item condition>:
        return <leaf value>
    # 2. Wishful thinking: assume solve(smaller) already works
    # 3. Combine current piece with recursive result(s)
    return <combine(current_piece, solve(smaller_x))>`,
    workedProblem:
      'Write `sum_even_leaves(tree)` that returns the sum of all even integer leaves inside a nested tuple `tree`. Example: `sum_even_leaves(((1, 2), (), (4, (5, 6)))) -> 12`.',
    workedThoughtProcess: [
      'Step 1 (Examples): `()` → `0`; `2` → `2`; `3` → `0`; `(2, 4)` → `6`.',
      'Step 2 (Base cases): Empty tuple `tree == ()` returns `0`. Leaf `type(tree) != tuple` returns `tree` if `tree % 2 == 0` else `0`.',
      'Step 3 (Wishful thinking): For a non-empty tuple `tree`, trust `sum_even_leaves(tree[0])` for the first branch and `sum_even_leaves(tree[1:])` for the rest.',
      'Step 4 (Combine): Simply add them (`+`). Note `tree[1:]` (slice, NOT `tree[1]`) handles 1-element tuples like `(6,)` safely!',
    ],
    workedSolution: `def sum_even_leaves(tree):
    if tree == ():
        return 0
    elif type(tree) != tuple:
        return tree if tree % 2 == 0 else 0
    else:
        return sum_even_leaves(tree[0]) + sum_even_leaves(tree[1:])`,
  },
  {
    id: 'hof',
    label: 'HOFs & Signal Pipelines',
    lectureRef: 'Lectures 4 & 6',
    whenToUse:
      'Question asks to "write a function that returns a function", abstract a series/fold pattern, or solve a sequence problem using `map`/`filter`/`accumulate` without loops.',
    steps: [
      {
        step: 1,
        title: 'Write the Call Signature & Return Type First',
        askYourself: 'How will the grader call my function? `f(a)(b)` or `f(g, x)`?',
        action:
          'Count the pairs of parentheses! Each extra `(...)` means your function must `return lambda ...:` or `return inner_fn`.',
        watchOut: 'Never confuse returning a function (`return lambda x: ...`) with calling it immediately!',
      },
      {
        step: 2,
        title: 'Separate What Is FIXED vs. What VARIES',
        askYourself: 'Which parts stay the same across problems, and which parts are passed in as functions?',
        action:
          'Fixed structure = your HOF body (`fold2`, `sum_series`, `newtons_method`). Varying pieces = function parameters (`term`, `next_fn`, `op`, `pred`).',
      },
      {
        step: 3,
        title: 'Match the Identity `base` to `op`',
        askYourself: 'What value changes nothing when combined with `op`?',
        action:
          '`+` → `0` | `*` → `1` | tuple `+` → `()` | string `+` → `""`. Check `a > b` or `seq == ()` returns `base`.',
      },
      {
        step: 4,
        title: 'For Sequences, Sketch the 4-Stage Pipeline',
        askYourself: 'Can I express this as Enumerate → Filter → Map → Accumulate?',
        action:
          '1. Flatten/generate items (`enumerate_tree` / `range`) → 2. Keep matching (`filter`) → 3. Transform (`map`) → 4. Combine (`accumulate` / `sum`).',
      },
      {
        step: 5,
        title: 'Check Closures & One-Time Iterators',
        askYourself: 'Will `map`/`filter` be read more than once? Does a lambda capture a changing loop variable?',
        action:
          'Wrap `tuple(map(...))` or `tuple(filter(...))` if inspected twice. Never pass `term(a)` where the function `term` itself is expected.',
      },
    ],
    skeleton: `# Pattern A: Function returning a function (Closure)
def make_transformer(param):
    def inner(x):
        return <expression using param and x>
    return inner                 # return function object, NOT inner()!

# Pattern B: Signal-Processing Pipeline (Lecture 6)
def process(data):
    items = enumerate_source(data)
    kept = tuple(filter(lambda x: <keep condition>, items))
    mapped = tuple(map(lambda x: <transform x>, kept))
    return accumulate(lambda a, b: <combine>, <base>, mapped)`,
    workedProblem:
      'Using `fold2(op, term, a, next_fn, b, base)`, write `product_of_squares(n)` that computes `1² * 2² * ... * n²` (returning `1` if `n < 1`).',
    workedThoughtProcess: [
      'Step 1 (Identify operator & base): We are multiplying, so `op = lambda x, y: x * y` and identity `base = 1` (NOT `0`!).',
      'Step 2 (Identify `term` & `next_fn`): Each term is `x * x`, stepping from `a = 1` to `b = n` by `lambda x: x + 1`.',
      'Step 3 (Verify edge case): When `n = 0`, `a > b` (`1 > 0`) immediately returns `base = 1`. Matches spec!',
    ],
    workedSolution: `def product_of_squares(n):
    return fold2(
        lambda x, y: x * y,      # op
        lambda x: x * x,         # term
        1,                       # a (start)
        lambda x: x + 1,         # next_fn
        n,                       # b (end)
        1                        # base (identity for *)
    )`,
  },
  {
    id: 'adt',
    label: 'Data Abstraction (ADT)',
    lectureRef: 'Lectures 5 & 8',
    whenToUse:
      'Question defines an ADT (rationals, Nim state, Stack, Multiset, custom records) and asks you to implement constructors, selectors, or high-level operations.',
    steps: [
      {
        step: 1,
        title: 'Draw the Abstraction Barrier Line on Paper',
        askYourself: 'Which functions belong BELOW the line (know the internal representation) vs. ABOVE it?',
        action:
          'Group your functions into Constructors (`make_...`), Selectors (accessors), Predicates (`is_...`), Printers — and keep all higher-level logic strictly ABOVE the barrier.',
      },
      {
        step: 2,
        title: 'Choose Representation + Check Constraints',
        askYourself: 'What operations must be fast, and what constraints apply to the elements?',
        action:
          'Unordered list (`O(1)` insert), Ordered list (`<` comparable, `O(log n)` search), BST (`<`, balanced `O(log n)`), Dict (hashable keys, `O(1)` lookup & count).',
      },
      {
        step: 3,
        title: 'Write Low-Level Ops Only Inside the Barrier',
        askYourself: 'Is raw indexing (`x[0]`, `d[k]`) confined ONLY to constructors & selectors?',
        action:
          'Never index into an ADT inside a high-level operation like `add_rat` or `intersection_of` if selectors exist.',
        watchOut: 'Midterm/Final rubrics deduct marks for crossing the abstraction barrier even when outputs match!',
      },
      {
        step: 4,
        title: 'Check Representation Invariants & Empty Edge Cases',
        askYourself: 'What breaks my representation? (`m >= 10` in `10*n + m`, empty stack `pop`, missing key?)',
        action:
          'Guard empty structures (`if is_empty(s): return None`) and use `d.get(x, 0)` for counts.',
      },
    ],
    skeleton: `# === BELOW BARRIER (knows internal dict representation) ===
def make_mset():                 # Constructor
    return {}

def adjoin_mset(x, s):           # Mutator / Constructor op
    s[x] = s.get(x, 0) + 1
    return s

def multiplicity_of(x, s):       # Selector
    return s.get(x, 0)

# === ABOVE BARRIER (uses ONLY ADT ops above!) ===
def contains(x, s):              # Predicate
    return multiplicity_of(x, s) > 0`,
    workedProblem:
      'Implement a LIFO Stack ADT (`make_stack`, `is_empty`, `push`, `pop`) and write `reverse_list(lst)` using ONLY the Stack ADT operations.',
    workedThoughtProcess: [
      'Step 1 (Barrier): `make_stack`, `is_empty`, `push`, `pop` know the internal list; `reverse_list` must NOT use `s[-1]` or `s.append()` directly.',
      'Step 2 (Empty guard): `pop(s)` returns `None` when `is_empty(s)` is `True`.',
      'Step 3 (Above barrier): Push every item from `lst` onto `s`, then pop until `is_empty(s)` into a new result list.',
    ],
    workedSolution: `def make_stack(): return []
def is_empty(s): return s == []
def push(s, item): s.append(item)
def pop(s): return None if is_empty(s) else s.pop()

def reverse_list(lst):           # Strictly ABOVE the abstraction barrier!
    s = make_stack()
    for x in lst:
        push(s, x)
    res = []
    while not is_empty(s):
        res.append(pop(s))
    return res`,
  },
  {
    id: 'data-algo',
    label: 'Lists, Search/Sort & PE Q2',
    lectureRef: 'Lectures 7, 8 & 11',
    whenToUse:
      'File/CSV processing, pivoting rows into dicts, frequency counting, Top-K rankings with ties, Binary Search, or custom sorting (PE Q2 & Finals).',
    steps: [
      {
        step: 1,
        title: 'Sketch the Data-Shape Pipeline First',
        askYourself: 'What shape is my input, what intermediate dict do I need, and what exact output type is required?',
        action:
          'Draw: `file/rows [(country, date, val)]` → `dict {country: [vals]}` → `sorted list [(country, avg)]`. (Pure Python only — NO NumPy/Pandas in PE!)',
      },
      {
        step: 2,
        title: 'Check: Mutate In-Place or Return New?',
        askYourself: 'Does the question say "modify `lst` in-place" or "return a new list without mutating `lst`"?',
        action:
          'In-place: `lst.sort(...)` (never assign `lst = lst.sort()`!). Non-mutating: `sorted(lst, ...)` or list comprehension.',
      },
      {
        step: 3,
        title: 'Guard File EOF, Missing Keys & Empty Inputs',
        askYourself: 'What happens on `[]`, missing keys, header rows, or trailing `\\n`?',
        action:
          'Read with `while line != \'\':` + `line.strip().split(\',\')`. Initialize dict buckets with `if k not in d: d[k] = []`.',
      },
      {
        step: 4,
        title: 'Write Multi-Key Sort Tuples & Tie Cutoffs',
        askYourself: 'How are ties broken? Does Top-K include everyone tied at rank `k`?',
        action:
          'Use tuple keys: `key=lambda r: (-r[1], r[0])` (score DESC, name ASC). For ties at `k`, grab `cutoff = ranked[k - 1][1]` and filter `>= cutoff`.',
      },
      {
        step: 5,
        title: 'Sanity-Check Time Complexity',
        askYourself: 'Am I accidentally doing `O(n²)` work or slicing inside Binary Search?',
        action:
          'Use a `dict` (`O(1)` lookup) instead of scanning a list in a loop. In Binary Search, pass `(low, high)` indices and check `if low > high: return False`.',
      },
    ],
    skeleton: `def analyze_rows(rows, k):
    # 1. Pivot / aggregate into a dictionary
    groups = {}
    for key, val in rows:
        if key not in groups:
            groups[key] = []
        groups[key].append(val)

    # 2. Compute summary metric per group
    summary = [(key, sum(vals) / len(vals)) for key, vals in groups.items()]

    # 3. Multi-key sort: metric DESC, key ASC
    ranked = sorted(summary, key=lambda r: (-r[1], r[0]))

    # 4. Top-K INCLUDING ties at k-th position
    if len(ranked) <= k:
        return ranked
    cutoff = ranked[k - 1][1]
    return [r for r in ranked if r[1] >= cutoff]`,
    workedProblem:
      'Given `records = [(student, score), ...]`, return the top `k` students by average score (highest first, alphabetical tie-break), including all ties at the `k`-th score.',
    workedThoughtProcess: [
      'Step 1 (Shape): `[(name, score)]` → `{name: [scores]}` → `[(name, avg)]` → sorted + tie-filtered.',
      'Step 2 (Missing key): Check `if name not in totals:` before appending `score`.',
      'Step 3 (Sort key): `(-avg, name)` sorts highest average first and breaks equal averages alphabetically.',
      'Step 4 (Edge case): If `len(ranked) <= k` or `k <= 0`, return early without `IndexError`!',
    ],
    workedSolution: `def top_k_students(records, k):
    if k <= 0 or not records:
        return []
    buckets = {}
    for name, score in records:
        if name not in buckets:
            buckets[name] = []
        buckets[name].append(score)
    avgs = [(name, sum(sc) / len(sc)) for name, sc in buckets.items()]
    ranked = sorted(avgs, key=lambda r: (-r[1], r[0]))
    if len(ranked) <= k:
        return ranked
    cutoff = ranked[k - 1][1]
    return [r for r in ranked if r[1] >= cutoff]`,
  },
  {
    id: 'oop',
    label: 'Object-Oriented (OOP)',
    lectureRef: 'Lecture 9 (PE Q3 & Finals)',
    whenToUse:
      'Question asks you to design classes, subclasses, interacting entities (BankAccount, Ships, Game Characters, Lecturers), or extend an existing class hierarchy.',
    steps: [
      {
        step: 1,
        title: 'Mark Up the Prompt: Nouns, "is-a", "has-a", Verbs',
        askYourself: 'What are the classes, which inherits from which, what state does each hold, and what can it do?',
        action:
          'Nouns → `class`; "is a kind of" → `class Child(Parent):`; "has a" → `self.attr` inside `__init__`; Verbs → `def method(self, ...):`.',
      },
      {
        step: 2,
        title: 'Draw the Inheritance Tree + Attribute Table',
        askYourself: 'Which attributes belong in the parent class so subclasses don\'t duplicate them?',
        action:
          'Put shared attributes in the parent `__init__`. Subclass `__init__` calls `super().__init__(...)` first, then sets only its NEW attributes.',
      },
      {
        step: 3,
        title: 'Audit `__init__` for the Two Fatal OOP Traps',
        askYourself: 'Did I pass `self` into `super()`? Did I write `items=[]` or `bag={}` as a default?',
        action:
          'ALWAYS write `super().__init__(name)` (NO `self`!) and `items=None` → `self.items = [] if items is None else list(items)`.',
        watchOut: 'Mutable default args in `__init__` cause all instances to share the same list/dict!',
      },
      {
        step: 4,
        title: 'Decide: Inherit, Override, or Extend via `super()`?',
        askYourself: 'Does the subclass behave identically, completely differently, or add extra behaviour on top of the parent?',
        action:
          'Identical → don\'t rewrite it. Add on top → call `super().method(...)` and build on its result. Remember `self.other_method()` dispatches polymorphically!',
      },
      {
        step: 5,
        title: 'Check Type Tests & Return Values vs. Mutations',
        askYourself: 'Does each method mutate `self`, return a string/value, or both?',
        action:
          'Use `isinstance(obj, Parent)` (NEVER `type(obj) == Parent`) when checking class membership across subclasses.',
      },
    ],
    skeleton: `class Parent:
    def __init__(self, name, items=None):
        self.name = name
        self.items = [] if items is None else list(items)

    def describe(self):
        return self.name

class Child(Parent):
    def __init__(self, name, bonus, items=None):
        super().__init__(name, items)      # NEVER pass self!
        self.bonus = bonus

    def describe(self):
        return super().describe() + " (+" + str(self.bonus) + ")"`,
    workedProblem:
      'Design `Account(owner, balance)` with `deposit(amt)` and `withdraw(amt)` (returns `False` if insufficient), and subclass `SavingsAccount(owner, balance, rate)` with `add_interest()` and an overridden `withdraw(amt)` that charges a `$1` fee.',
    workedThoughtProcess: [
      'Step 1 (Hierarchy): `SavingsAccount` **is-a** `Account`. `Account` has `owner`, `balance`; `SavingsAccount` adds `rate`.',
      'Step 2 (`__init__`): `SavingsAccount.__init__` calls `super().__init__(owner, balance)` and stores `self.rate = rate`.',
      'Step 3 (Extend via `super()`): `SavingsAccount.withdraw(amt)` simply delegates `return super().withdraw(amt + 1)` — reusing the balance check cleanly without duplicating code!',
    ],
    workedSolution: `class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amt):
        self.balance += amt
        return self.balance

    def withdraw(self, amt):
        if amt > self.balance:
            return False
        self.balance -= amt
        return True

class SavingsAccount(Account):
    def __init__(self, owner, balance=0, rate=0.02):
        super().__init__(owner, balance)
        self.rate = rate

    def add_interest(self):
        self.balance += self.balance * self.rate
        return self.balance

    def withdraw(self, amt):
        return super().withdraw(amt + 1)   # reuses parent check!`,
  },
  {
    id: 'exceptions',
    label: 'Exception Handling',
    lectureRef: 'Lecture 10',
    whenToUse:
      'Question asks you to safely handle invalid inputs/files, define a custom exception (`MyError`), or guarantee cleanup with `finally`.',
    steps: [
      {
        step: 1,
        title: 'Isolate ONLY the Risky Lines Inside `try:`',
        askYourself: 'Which exact operations can fail (`x / y`, `int(s)`, `d[k]`, `open(...)`)?',
        action:
          'Keep `try:` small so you don\'t accidentally catch an unrelated bug from later lines.',
      },
      {
        step: 2,
        title: 'Order `except` Clauses Specific → General',
        askYourself: 'Which exact exception types should be caught (`ValueError`, `ZeroDivisionError`, `MyError`)?',
        action:
          'List specific exceptions first; put any wildcard `except:` LAST (otherwise `SyntaxError`). Use `except MyError as e:` to read `e.value`.',
      },
      {
        step: 3,
        title: 'Split Success (`else:`) vs. Always-Run (`finally:`)',
        askYourself: 'Should this line run ONLY when `try` succeeds, or ALWAYS (even on error)?',
        action:
          'Success-only logic → `else:`. Cleanup (closing files, logging completion) → `finally:` (runs even before uncaught exceptions!).',
      },
      {
        step: 4,
        title: 'Custom Exceptions Inherit from `Exception`',
        askYourself: 'Do I need to signal a domain-specific error back to the caller?',
        action:
          'Write `class MyError(Exception):` with `__init__` and `__str__`, then trigger it with `raise MyError(...)`.',
      },
    ],
    skeleton: `class CustomError(Exception):
    def __init__(self, value):
        self.value = value
    def __str__(self):
        return repr(self.value)

def safe_op(x, y):
    try:
        res = x / y
    except ZeroDivisionError:
        return None
    except TypeError:
        raise CustomError("bad types")
    else:
        return res
    finally:
        pass   # ALWAYS runs (even before return or uncaught error!)`,
    workedProblem:
      'Write `safe_avg(str_nums)` that parses a list of strings into integers, ignoring non-integer strings, and raises `ValueError("no valid numbers")` if none are valid.',
    workedThoughtProcess: [
      'Step 1 (Risky line): `int(s)` can raise `ValueError` — isolate it inside `try:`.',
      'Step 2 (Success path): Put `valid.append(val)` inside `else:` (runs only if `int(s)` succeeded).',
      'Step 3 (Empty check): After the loop, if `not valid:`, `raise ValueError("no valid numbers")`.',
    ],
    workedSolution: `def safe_avg(str_nums):
    valid = []
    for s in str_nums:
        try:
            val = int(s)
        except ValueError:
            continue
        else:
            valid.append(val)
    if not valid:
        raise ValueError("no valid numbers")
    return sum(valid) / len(valid)`,
  },
];

export const PAPER_METHODS: PaperMethod[] = [
  {
    id: 'var-table',
    title: '1. Variable State Table',
    bestFor: 'Loops, conditionals, `and`/`or`, variable scoping & `UnboundLocalError`',
    howToDraw:
      'Draw columns: `Line | var1 | var2 | Output`. Never erase old values — cross them out and write the new value underneath so you can backtrack mistakes.',
    goldenRule:
      'Before running a function body, scan ALL lines inside `def` for `=` or `+=` to mark which variables are LOCAL vs. FREE!',
  },
  {
    id: 'box-arrow',
    title: '2. Box-and-Pointer Diagram',
    bestFor: 'Lists, nested lists, `copy()`, `del`, `+=` vs `= +`, mutable default args',
    howToDraw:
      'Draw variable names on the LEFT, list boxes with memory IDs (`0x1`, `0x2`) on the RIGHT, and ARROWS from variables/slots to boxes.',
    goldenRule:
      'In-place ops (`append`, `+=` on list, `lst[i] = ...`) change the BOX (every arrow pointing there sees it). Assignment (`a = ...`) moves ONLY `a`\'s arrow!',
  },
  {
    id: 'call-stack',
    title: '3. Call Stack & Type Annotations',
    bestFor: 'Recursion (linear & tree), closures, and Higher-Order Function chains',
    howToDraw:
      'Stack frames downward with their local args + deferred expression on the right (e.g., `4 * [wait] - 1`). Unwind strictly from bottom frame back up. For HOFs, label every sub-expression `[func]` or `[val]`.',
    goldenRule:
      'In tree recursion, finish the ENTIRE left branch (and cross out its frames) before drawing the right branch.',
  },
  {
    id: 'mro-clauses',
    title: '4. MRO Line & Clause Checklist',
    bestFor: 'OOP Inheritance / Diamond MRO (`super()`, `self`) & `try/except/else/finally`',
    howToDraw:
      'For OOP, write `ConcreteClass MRO: C → A → B → Base → object` on ONE line at the top of your paper. For exceptions, write `[try] [except] [else] [finally]` and tick/cross each box.',
    goldenRule:
      '`self.m()` ALWAYS starts at the LEFT end of the concrete object\'s MRO; `super().m()` moves ONE step right from the *current class* in that same MRO!',
  },
];

export const GUIDED_TRACE_DRILLS: GuidedTraceDrill[] = [
  {
    id: 'drill-aliasing',
    title: 'Drill 1: Shallow Copy, Aliasing & `+=` vs `= +`',
    topicTag: 'Lecture 7 • Lists & Memory',
    methodUsed: 'Box-and-Pointer Diagram',
    codeLines: [
      'a = [[1, 2], [3, 4]]',
      'b = a.copy()',
      'c = a',
      'b[0].append(5)',
      'a += [[6]]',
      'a = a + [[7]]',
      'print(len(a), len(b), len(c), c[0])',
    ],
    steps: [
      {
        lineIdx: 0,
        action: 'Create outer list `0x100` pointing to inner lists `0x101=[1, 2]` and `0x102=[3, 4]`.',
        scratchpad: 'a ──► 0x100: [ →0x101([1,2]), →0x102([3,4]) ]',
      },
      {
        lineIdx: 1,
        action: '`a.copy()` makes a NEW outer box `0x200`, copying the SAME inner arrows!',
        scratchpad:
          'a ──► 0x100: [ →0x101, →0x102 ]\nb ──► 0x200: [ →0x101, →0x102 ]  (SHALLOW!)',
      },
      {
        lineIdx: 2,
        action: '`c = a` points `c` to the exact same outer box `0x100` as `a`.',
        scratchpad:
          'a, c ──► 0x100: [ →0x101, →0x102 ]\nb    ──► 0x200: [ →0x101, →0x102 ]',
      },
      {
        lineIdx: 3,
        action: '`b[0].append(5)` follows `b[0]` to `0x101` and mutates box `0x101` in-place!',
        scratchpad:
          '0x101 is now [1, 2, 5]!\nBecause a, b, AND c all point to 0x101, ALL THREE see [1, 2, 5].',
        checkpointQuestion: 'Does `c[0]` change after `b[0].append(5)`?',
        checkpointAnswer: 'YES! `c[0]` is `0x101`, which is shared with `b[0]` because `.copy()` is shallow.',
      },
      {
        lineIdx: 4,
        action: '`a += [[6]]` mutates list `0x100` IN-PLACE (just like `a.extend([[6]])`)!',
        scratchpad:
          'a, c ──► 0x100: [ →0x101, →0x102, →0x103([6]) ]   (len = 3)\nb    ──► 0x200: [ →0x101, →0x102 ]                (len = 2)',
        checkpointQuestion: 'What is `len(c)` vs `len(b)` right now?',
        checkpointAnswer: '`len(c) == 3` (alias of `0x100`), while `len(b) == 2` (`0x200` is a separate outer box).',
      },
      {
        lineIdx: 5,
        action: '`a = a + [[7]]` builds a BRAND-NEW outer box `0x300` (len 4) and moves ONLY `a`\'s arrow!',
        scratchpad:
          'a ──► 0x300: [ →0x101, →0x102, →0x103, →0x104([7]) ] (len = 4)\nc ──► 0x100: [ →0x101, →0x102, →0x103 ]              (len = 3)\nb ──► 0x200: [ →0x101, →0x102 ]                      (len = 2)',
      },
      {
        lineIdx: 6,
        action: 'Read off lengths and `c[0]` directly from the diagram!',
        scratchpad: 'len(a)=4, len(b)=2, len(c)=3, c[0]=[1, 2, 5]',
        outputSoFar: '4 2 3 [1, 2, 5]',
      },
    ],
    finalTakeaway:
      'Drawing box IDs (`0x100`, `0x200`, `0x300`) makes shallow copy, `+=` in-place mutation, and `= +` rebinding impossible to mix up!',
  },
  {
    id: 'drill-recursion',
    title: 'Drill 2: Recursion Call Stack & Deferred Unwinding',
    topicTag: 'Lecture 3 • Recursion',
    methodUsed: 'Call Stack Downward + Unwind Bottom-Up',
    codeLines: [
      'def trace_me(n):',
      '    if n <= 1:',
      '        return 1',
      '    a = trace_me(n - 1)',
      '    return n * a - 1',
      'print(trace_me(4))',
    ],
    steps: [
      {
        lineIdx: 5,
        action: 'Push bottom-most call `trace_me(4)` onto the stack.',
        scratchpad: 'Frame 1: trace_me(n=4)  [waiting...]',
      },
      {
        lineIdx: 3,
        action: '`n=4` is not `<= 1`. Pause `trace_me(4)` at line 4 (`a = ?`) and call `trace_me(3)`.',
        scratchpad:
          'Frame 1: n=4  | deferred: return 4 * a - 1\nFrame 2: n=3  | deferred: return 3 * a - 1',
      },
      {
        lineIdx: 3,
        action: 'Pause `trace_me(3)` → call `trace_me(2)` → pause → call `trace_me(1)`.',
        scratchpad:
          'Frame 1: n=4  | deferred: 4 * a - 1\nFrame 2: n=3  | deferred: 3 * a - 1\nFrame 3: n=2  | deferred: 2 * a - 1\nFrame 4: n=1  | checking base case...',
      },
      {
        lineIdx: 2,
        action: '`n=1` hits base case `n <= 1`! Pop Frame 4 and send `1` back to Frame 3 (`a = 1`).',
        scratchpad:
          'Frame 4 (n=1) ──► returns 1  (popped!)\nFrame 3 (n=2): receives a = 1',
      },
      {
        lineIdx: 4,
        action: 'Unwind Frame 3 (`n=2`): `2 * 1 - 1 = 1` → send `1` to Frame 2 (`a = 1`).',
        scratchpad:
          'Frame 3 (n=2): 2 * 1 - 1 = 1 ──► returns 1\nFrame 2 (n=3): receives a = 1',
        checkpointQuestion: 'What does Frame 2 (`n=3`) return to Frame 1 (`n=4`)?',
        checkpointAnswer: '`3 * 1 - 1 = 2`! So Frame 1 receives `a = 2`.',
      },
      {
        lineIdx: 4,
        action: 'Unwind Frame 2 (`n=3` → `2`), then unwind Frame 1 (`n=4`): `4 * 2 - 1 = 7`!',
        scratchpad:
          'Frame 2 (n=3): 3 * 1 - 1 = 2 ──► returns 2\nFrame 1 (n=4): 4 * 2 - 1 = 7 ──► returns 7',
        outputSoFar: '7',
      },
    ],
    finalTakeaway:
      'Never try to unwind in your head! Write each frame\'s deferred formula (`n * a - 1`) on paper, hit the base case, and plug numbers back up one frame at a time.',
  },
  {
    id: 'drill-hof',
    title: 'Drill 3: HOF Chained Calls & Closure Tracing',
    topicTag: 'Lecture 4 • Higher-Order Functions',
    methodUsed: 'Left-to-Right Substitution + Type Labels',
    codeLines: [
      'def make_op(k):',
      '    return lambda x: x * k + 1',
      'def apply_twice(f):',
      '    return lambda x: f(f(x))',
      'g = apply_twice(make_op(2))',
      'print(g(3))',
    ],
    steps: [
      {
        lineIdx: 4,
        action: 'Evaluate the INNER argument first: `make_op(2)`.',
        scratchpad: 'make_op(2)  ──►  f1 = (lambda x: x * 2 + 1)   [TYPE: function, k=2]',
      },
      {
        lineIdx: 4,
        action: 'Pass `f1` into `apply_twice(f1)` and label what `g` is!',
        scratchpad: 'g = apply_twice(f1)  ──►  (lambda x: f1(f1(x)))   [TYPE: function, f=f1]',
        checkpointQuestion: 'Has `f1` been called yet after line 5?',
        checkpointAnswer: 'NO! `apply_twice` only CREATED and returned a new lambda `g`. Nothing runs until `g(3)`!',
      },
      {
        lineIdx: 5,
        action: 'Now call `g(3)` → substitutes `x = 3` into `f1(f1(x))` → `f1(f1(3))`.',
        scratchpad: 'g(3)  ──►  f1( f1(3) )',
      },
      {
        lineIdx: 1,
        action: 'Evaluate inner `f1(3)` with `k = 2`: `3 * 2 + 1 = 7`.',
        scratchpad: 'f1(3) = 3 * 2 + 1 = 7   [TYPE: int]\nRemaining: f1(7)',
      },
      {
        lineIdx: 1,
        action: 'Evaluate outer `f1(7)` with `k = 2`: `7 * 2 + 1 = 15`.',
        scratchpad: 'f1(7) = 7 * 2 + 1 = 15   [TYPE: int]',
        outputSoFar: '15',
      },
    ],
    finalTakeaway:
      'Give every returned lambda a short nickname (`f1`, `g`) and write `[TYPE: function]` next to it on paper — you\'ll instantly see how many arguments remain!',
  },
  {
    id: 'drill-mro',
    title: 'Drill 4: OOP `self` Dispatch & Diamond MRO',
    topicTag: 'Lecture 9 • OOP & Multiple Inheritance',
    methodUsed: 'Single-Line MRO Strip',
    codeLines: [
      'class Speaker:',
      '    def say(self, s): return s',
      'class Lecturer(Speaker):',
      '    def talk(self, s): return self.say(s + "?")',
      'class Arrogant(Lecturer):',
      '    def say(self, s): return super().say(s) + "!"',
      'class Singer(Speaker):',
      '    def say(self, s): return "la-" + super().say(s)',
      'class SAL(Arrogant, Singer): pass',
      'print(SAL().talk("CS"))',
    ],
    steps: [
      {
        lineIdx: 8,
        action: 'STEP 0 (ALWAYS FIRST!): Write the concrete class `SAL`\'s MRO on one line!',
        scratchpad:
          'MRO(SAL):  SAL ─► Arrogant ─► Lecturer ─► Singer ─► Speaker ─► object\n(Rule: ALL subclasses — including Singer — come BEFORE shared parent Speaker!)',
      },
      {
        lineIdx: 9,
        action: 'Call `SAL().talk("CS")`: scan MRO left-to-right for `talk` → found in `Lecturer`!',
        scratchpad: 'Enter Lecturer.talk(self=<SAL>, s="CS")\nRuns: return self.say("CS?")',
      },
      {
        lineIdx: 3,
        action: 'Inside `Lecturer.talk`, call `self.say("CS?")`. Where does lookup start?',
        scratchpad: 'self is <SAL> ─► restart at LEFT of MRO(SAL)!\nFirst class defining say() is Arrogant!',
        checkpointQuestion: 'Does `self.say("CS?")` call `Speaker.say` or `Arrogant.say`?',
        checkpointAnswer: '`Arrogant.say`! `self` is ALWAYS the full concrete `SAL` instance.',
      },
      {
        lineIdx: 5,
        action: 'Inside `Arrogant.say("CS?")`: calls `super().say("CS?")` + `"!"`.',
        scratchpad:
          'MRO(SAL): SAL ─► [Arrogant] ─► Lecturer(no say) ─► Singer ─► Speaker\nsuper() from Arrogant lands on Singer.say("CS?")!',
        checkpointQuestion: 'Which class does `super().say("CS?")` inside `Arrogant` jump to?',
        checkpointAnswer: '`Singer.say` — NOT `Speaker.say`! Because `Singer` is before `Speaker` in `SAL`\'s MRO.',
      },
      {
        lineIdx: 7,
        action: 'Inside `Singer.say("CS?")`: calls `super().say("CS?")` → `Speaker.say("CS?")` returns `"CS?"`.',
        scratchpad:
          'Speaker.say("CS?") ──► "CS?"\nSinger.say("CS?")  ──► "la-" + "CS?" = "la-CS?"',
      },
      {
        lineIdx: 5,
        action: 'Return to `Arrogant.say`: `"la-CS?" + "!"` = `"la-CS?!"` → returned by `talk`!',
        scratchpad: 'Arrogant.say returns "la-CS?!" ──► Lecturer.talk returns "la-CS?!"',
        outputSoFar: 'la-CS?!',
      },
    ],
    finalTakeaway:
      'Write the 1-line MRO before tracing a single line of OOP! `self.m()` restarts at the left; `super().m()` steps one class right in that SAME line.',
  },
  {
    id: 'drill-exceptions',
    title: 'Drill 5: `try / except / else / finally` Control Flow',
    topicTag: 'Lecture 10 • Exception Handling',
    methodUsed: '4-Clause Checklist `[try] [except] [else] [finally]`',
    codeLines: [
      'def run(x, y):',
      '    out = []',
      '    try:',
      '        res = x / y',
      '        out.append("T")',
      '    except ZeroDivisionError:',
      '        out.append("E")',
      '    else:',
      '        out.append("S")',
      '    finally:',
      '        out.append("F")',
      '    return out',
      'print(run(4, 2), run(4, 0))',
    ],
    steps: [
      {
        lineIdx: 12,
        action: 'Call 1: `run(4, 2)` — enter `try:`. `4 / 2 = 2.0` succeeds, appends `"T"`.',
        scratchpad: 'Call 1 (4, 2):  [✓ try]  [✗ except]  [? else]  [? finally]   | out = ["T"]',
      },
      {
        lineIdx: 8,
        action: 'No exception in `try:` → `except` skipped, `else:` RUNS (`"S"`), then `finally:` RUNS (`"F"`).',
        scratchpad: 'Call 1 (4, 2):  [✓ try]  [✗ except]  [✓ else]  [✓ finally]   | returns ["T", "S", "F"]',
      },
      {
        lineIdx: 3,
        action: 'Call 2: `run(4, 0)` — `4 / 0` raises `ZeroDivisionError` immediately! Line 5 (`"T"`) is SKIPPED.',
        scratchpad: 'Call 2 (4, 0):  [⚡ try threw ZeroDivisionError]  | out = []',
      },
      {
        lineIdx: 6,
        action: '`except ZeroDivisionError:` matches → appends `"E"`. Now what about `else:`?',
        scratchpad: 'Call 2 (4, 0):  [✓ except -> "E"]  [? else]  [? finally]   | out = ["E"]',
        checkpointQuestion: 'Does `else:` run after `except` catches the error?',
        checkpointAnswer: 'NO! `else:` runs ONLY when `try:` finishes with zero exceptions. So `"S"` is SKIPPED.',
      },
      {
        lineIdx: 10,
        action: '`finally:` ALWAYS runs → appends `"F"` → returns `["E", "F"]`!',
        scratchpad:
          'Call 2 (4, 0):  [✓ except]  [✗ else]  [✓ finally]   | returns ["E", "F"]\nBonus: On run("4", "2"), TypeError is uncaught -> finally STILL runs BEFORE TypeError propagates!',
        outputSoFar: "['T', 'S', 'F'] ['E', 'F']",
      },
    ],
    finalTakeaway:
      'Tick the 4-box checklist on paper: `else` = "try succeeded cleanly"; `finally` = "ALWAYS executes, even right before an uncaught crash!"',
  },
];

export const EXAM_CHECKLIST: ExamChecklistItem[] = [
  {
    id: 'chk-return',
    category: 'Functions',
    check: 'Did I `return` the result (not just `print` it), and avoid assigning `lst = lst.sort()` or `lst = lst.append(x)`?',
  },
  {
    id: 'chk-base',
    category: 'Recursion',
    check: 'Do my base cases cover empty (`()`, `[]`, `""`), zero, AND overshoot (`amount < 0`, `low > high`)?',
  },
  {
    id: 'chk-alias',
    category: 'Lists & Mutation',
    check: 'Did I check whether `+=` mutated an alias, whether `.copy()` is shallow, and use `[[0]*c for _ in range(r)]` for 2D grids?',
  },
  {
    id: 'chk-iter',
    category: 'Sequences & Dicts',
    check: 'Did I wrap reused `map`/`filter` in `tuple(...)`, write `(x,)` for 1-element tuples, and remember `k in d` checks KEYS only?',
  },
  {
    id: 'chk-oop',
    category: 'OOP',
    check: 'No `self` inside `super().__init__(...)`, no mutable defaults (`items=None`), `isinstance` instead of `type ==`, and MRO written on 1 line?',
  },
  {
    id: 'chk-exc',
    category: 'Exceptions',
    check: 'Are specific `except` blocks before bare `except:`, and did I remember `finally` runs even before uncaught errors?',
  },
];
