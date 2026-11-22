export type MicroVisualId =
  | 'recursion'
  | 'growth'
  | 'hof'
  | 'memory'
  | 'bsearch'
  | 'mset'
  | 'oop'
  | 'exceptions';

export interface CodeExample {
  title: string;
  summary: string;
  code: string;
  output?: string;
  keyPoints: string[];
  visual?: MicroVisualId;
}

export interface ExamTrap {
  title: string;
  code: string;
  commonGuess: string;
  actualResult: string;
  why: string;
  rule: string;
}

export interface McqQuestion {
  kind: 'mcq';
  id: string;
  prompt: string;
  code?: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

export interface BugLineQuestion {
  kind: 'bug-line';
  id: string;
  prompt: string;
  lines: string[];
  bugLineIdx: number;
  failingCase: string;
  explanation: string;
  fix: string;
}

export type PracticeQuestion = McqQuestion | BugLineQuestion;

export interface Topic {
  id: string;
  number: number;
  title: string;
  week: string;
  tagline: string;
  examFocus: string;
  examples: CodeExample[];
  traps: ExamTrap[];
  practice: PracticeQuestion[];
}

export const TOPICS: Topic[] = [
  /* =====================================================================
   * TOPIC 1: FUNCTIONAL ABSTRACTION, WISHFUL THINKING & SCOPE
   * Lectures 1, 2 & 9 (Scoping + Default Args)
   * ===================================================================== */
  {
    id: 'abstraction-scope',
    number: 1,
    title: 'Functional Abstraction, Wishful Thinking & Scope',
    week: 'Lectures 1–2 & 9',
    tagline:
      'Black-box functions, runes picture language, top-down design, variable scoping, and mutable default traps.',
    examFocus: 'Midterm • PE • Final',
    examples: [
      {
        title: 'Expressions, Short-Circuiting & `return` vs `None`',
        summary:
          'Python evaluates `and` and `or` lazily from left to right and returns the deciding operand itself (not necessarily `True`/`False`). Every `def` without a `return` value returns `None`.',
        code: `# Short-circuiting returns the deciding operand:
print(0 or "CS1010A")          # "CS1010A" (0 is falsy)
print("hi" and 42)             # 42 (both truthy -> last value)
print("" and 1 / 0)            # "" (stops early, no ZeroDivisionError!)

# return vs side-effect (print / show):
def double_show(x):
    print(x * 2)               # prints, returns None!

def double_val(x):
    return x * 2               # returns value to caller

# Anonymous function (lambda):
square = lambda x: x * x
print(square(5), double_val(5))`,
        output: `CS1010A
42

25 10`,
        keyPoints: [
          'Falsy values in Python: `False`, `None`, `0`, `0.0`, `""`, `()`, `[]`, `{}`.',
          '`=` is assignment, `==` checks equality, `!=` checks inequality; use `\\` to escape quotes like `\'That\\\'s\'`.',
          'In Lecture 2 (`runes.py`), `show(pic)` displays a picture as a side effect and returns `None`; `return` passes a value back.',
        ],
      },
      {
        title: 'Black-Box Abstraction & Picture Language (`runes.py`)',
        summary:
          'Functional abstraction treats a function as a black box: callers only care WHAT it computes, not HOW it is implemented. Complex picture operations are built from a few primitives.',
        code: `from math import exp, log

# Two implementations with the exact same specification (WHAT):
def square_v1(x):
    return x * x

def square_v2(x):
    return exp(2 * log(x))       # works for x > 0; caller code unchanged!

# Picture language (Lecture 2): build derived ops from primitives
# Primitives: quarter_turn_right, stack, stack_frac, overlay, scale
def turn_upside_down(pic):
    return quarter_turn_right(quarter_turn_right(pic))

def quarter_turn_left(pic):
    return turn_upside_down(quarter_turn_right(pic))

def beside(pic1, pic2):
    return quarter_turn_right(
        stack(quarter_turn_left(pic2), quarter_turn_left(pic1))
    )`,
        keyPoints: [
          '7 properties of good abstraction (L2): natural subtasks (divide & conquer), easier to understand, captures common patterns, code reuse, hides irrelevant details, separates WHAT from HOW, and makes debugging easier.',
          'Because `beside` and `make_cross` only rely on primitive specifications, changing a primitive implementation never breaks derived functions.',
          'Functions are objects in Python: `foo = lambda pic: beside(pic, pic)` binds an anonymous function to a name.',
        ],
      },
      {
        title: 'Wishful Thinking, Block Structure & No Magic Numbers',
        summary:
          'Top-down design ("wishful thinking") assumes helper functions already exist, then implements them. Name constants to avoid magic numbers and nest private helpers using block structure.',
        code: `from math import sqrt, ceil

# Block structure: sum_of_squares is local to hypotenuse
def hypotenuse(a, b):
    def sum_of_squares(x, y):
        return x * x + y * y
    return sqrt(sum_of_squares(a, b))

# Wishful thinking + named constants (Lecture 2 Comfort Delgro taxi_fare):
def taxi_fare(distance):
    stage1, stage2 = 1000, 10000
    start_fare, increment = 3.20, 0.22
    block1, block2 = 400, 350

    if distance <= stage1:
        return start_fare
    elif distance <= stage2:
        return start_fare + ceil((distance - stage1) / block1) * increment
    else:
        return taxi_fare(stage2) + ceil((distance - stage2) / block2) * increment

print(round(taxi_fare(12000), 2))`,
        output: '9.58',
        keyPoints: [
          'Calling `taxi_fare(stage2)` reuses the stage-2 boundary fare via wishful thinking instead of hardcoding `8.26`.',
          'Replacing raw numbers (`400`, `350`, `0.22`) with named variables makes fare changes a one-line edit.',
          'Helper functions nested inside another function (`sum_of_squares`) keep the global namespace clean.',
        ],
      },
      {
        title: 'Variable Scope: Bound vs. Free Variables & Default Args',
        summary:
          'Formal parameters are bound variables; names not bound locally are free variables looked up from innermost to outermost scope. Assigning anywhere in a function marks that name local for the whole body.',
        code: `x = 10
def addx(y):                     # y is BOUND; x is FREE (found in global scope)
    return y + x

# Mutating a list element does NOT rebind the variable name:
nums = [10]
def bump():
    print(nums)                  # OK! nums is free (never assigned to)
    nums[0] += 1                 # mutates element inside list, NOT nums itself

bump()
print(addx(5), nums)

# Default arguments MUST come after non-default parameters:
def power(base, exp=2):
    return base ** exp`,
        output: `[10]
15 [11]`,
        keyPoints: [
          'Local shadowing: defining `pi = 22 / 7` inside a function only shadows global `pi` inside that function.',
          'Assigning `x = ...` or `x += 1` anywhere in a function makes `x` local for the ENTIRE function — reading `x` earlier causes `UnboundLocalError`.',
          'Default arguments are evaluated ONCE at `def` time ("static"), so never use mutable defaults like `[]` or `{}`.',
        ],
      },
    ],
    traps: [
      {
        title: '`and` / `or` Do Not Always Return Booleans',
        code: `print(0 or "Python")
print([] and 1 / 0)
print(3 and 5)`,
        commonGuess: 'True, False, True',
        actualResult: `Python
[]
5`,
        why: '`or` returns the first truthy operand (or the last operand); `and` returns the first falsy operand (or the last operand). Short-circuiting stops `1 / 0` from ever executing.',
        rule: 'Trace left-to-right: `a or b` returns `a` if truthy else `b`; `a and b` returns `a` if falsy else `b`.',
      },
      {
        title: '`UnboundLocalError` vs. Mutating an Outer List',
        code: `x = 10
def broken():
    print(x)          # tries to read local x before assignment!
    x += 1            # makes x LOCAL for the entire function

broken()`,
        commonGuess: 'Prints 10, then updates x to 11',
        actualResult: "UnboundLocalError: cannot access local variable 'x'",
        why: 'Because `x += 1` assigns to `x`, Python compiles `x` as a local variable for the whole function body, so `print(x)` fails before `x` has a value. By contrast, `nums[0] += 1` mutates the list without assigning to `nums`.',
        rule: 'Any assignment (`=`, `+=`) to a name anywhere inside `def` makes that name local across the entire function.',
      },
      {
        title: 'Mutable Default Argument Trap (Lecture 9 Shopping List)',
        code: `def add_item(item, quantity=1, cart={}):
    cart[item] = quantity
    return cart

clothes = add_item('Skirt', 2)
electronics = add_item('iPod', 1)
print(electronics)`,
        commonGuess: "{'iPod': 1}",
        actualResult: "{'Skirt': 2, 'iPod': 1}",
        why: 'Default parameter values are created ONCE when `def` runs. Both calls without a 3rd argument share and mutate the exact same dictionary!',
        rule: 'Never write `cart={}` or `lst=[]` as a default parameter. Use `cart=None` and create `if cart is None: cart = {}` inside the body.',
      },
      {
        title: 'Confusing `print()` with `return`',
        code: `def square(x):
    print(x * x)

ans = square(4) + 1`,
        commonGuess: '17',
        actualResult: "Prints 16, then TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'",
        why: '`square(4)` prints `16` to the screen, reaches the end without a `return`, and gives back `None`. Adding `None + 1` crashes.',
        rule: 'Always check whether a question asks you to `return` a value or `print` it.',
      },
    ],
    practice: [
      {
        kind: 'mcq',
        id: 'abs-q1',
        prompt: 'What does this expression evaluate to?',
        code: `(0 and 1 / 0) or ("CS1010A" and 2026)`,
        options: ['ZeroDivisionError', 'True', '2026', '"CS1010A"'],
        correctIdx: 2,
        explanation:
          '`0 and 1 / 0` short-circuits and returns `0` without dividing by zero. Then `0 or ("CS1010A" and 2026)` evaluates the right side, where both operands are truthy so `and` returns the last operand `2026`.',
      },
      {
        kind: 'mcq',
        id: 'abs-q2',
        prompt: 'What happens when these two functions are called?',
        code: `x = 10
y = [10]

def f():
    print(y[0])
    y[0] += 1

def g():
    print(x)
    x += 1`,
        options: [
          'Both f() and g() work and print 10',
          'f() prints 10 and updates y to [11]; g() raises UnboundLocalError',
          'Both f() and g() raise UnboundLocalError',
          'f() raises TypeError; g() prints 10',
        ],
        correctIdx: 1,
        explanation:
          'In `f()`, `y[0] += 1` mutates an element of the list `y` without rebinding `y`, so `y` stays a free global variable. In `g()`, `x += 1` assigns to `x`, making `x` local for the entire function and causing `UnboundLocalError` on `print(x)`.',
      },
      {
        kind: 'bug-line',
        id: 'abs-q3',
        prompt: 'Click the line that causes `electronics` to accidentally contain `"Skirt"` from an earlier call:',
        lines: [
          'def add_item(item, qty=1, cart={}):',
          '    if item in cart:',
          '        cart[item] += qty',
          '    else:',
          '        cart[item] = qty',
          '    return cart',
        ],
        bugLineIdx: 0,
        failingCase: "add_item('Skirt', 2); add_item('iPod', 1) -> {'Skirt': 2, 'iPod': 1}",
        explanation:
          'The default `cart={}` is created only once when `add_item` is defined, so every call omitting `cart` shares the same dictionary.',
        fix: 'def add_item(item, qty=1, cart=None):\n    if cart is None:\n        cart = {}',
      },
      {
        kind: 'mcq',
        id: 'abs-q4',
        prompt: 'What is printed by the code below?',
        code: `x = 5
def foo(x):
    return x + 1

def bar(y):
    return x + y

print(foo(10), bar(10), x)`,
        options: ['11 15 5', '11 20 10', '6 15 5', 'UnboundLocalError'],
        correctIdx: 0,
        explanation:
          'In `foo(x)`, `x` is a bound parameter shadowing global `x` (`10 + 1 = 11`), leaving global `x` untouched at `5`. In `bar(y)`, `x` is a free variable that looks up global `x = 5` (`5 + 10 = 15`).',
      },
    ],
  },

  /* =====================================================================
   * TOPIC 2: RECURSION, ITERATION & ORDER OF GROWTH
   * Lectures 3 & 4 (Counting Change)
   * ===================================================================== */
  {
    id: 'recursion-growth',
    number: 2,
    title: 'Recursion, Iteration & Order of Growth',
    week: 'Lectures 3–4',
    tagline:
      'Recursive vs. iterative processes, deferred operations, tree recursion, fast_expt, GCD, Counting Change, and O/Ω/Θ.',
    examFocus: 'Midterm • PE • Final',
    examples: [
      {
        title: 'Recursive Process vs. Iterative Process (`factorial`)',
        summary:
          'A recursive process builds up deferred (pending) operations that wait for recursive calls to return. An iterative process keeps all state in loop variables with zero deferred operations.',
        code: `# Linear Recursive Process: Time O(n), Space O(n) (deferred *)
def fact_rec(n):
    if n == 0:
        return 1
    return n * fact_rec(n - 1)       # deferred multiplication!

# Iterative Process: Time O(n), Space O(1) (no deferred ops)
def fact_iter(n):
    product, counter = 1, 1
    while counter <= n:
        product *= counter
        counter += 1
    return product

# Equivalent for-loop using range(start, stop[, step]):
def fact_for(n):
    product = 1
    for i in range(1, n + 1):        # start inclusive, stop exclusive
        product *= i
    return product`,
        output: 'fact_rec(4) == fact_iter(4) == fact_for(4) == 24',
        keyPoints: [
          'Recursion needs: (1) a terminating base case, and (2) recursive step(s) moving closer to the base case.',
          'Deferred operations determine Space complexity of a recursive process — each pending frame lives on the call stack.',
          '`break` exits the innermost loop immediately; `continue` skips straight to the next loop iteration.',
        ],
        visual: 'recursion',
      },
      {
        title: 'Tree Recursion, Mutual Recursion & Counting Change (`cc`)',
        summary:
          'When a function makes 2+ recursive calls per step, it forms a call tree: Time grows exponentially, while Space equals the maximum depth of the tree.',
        code: `# Tree recursion: Time O(Phi^n) where Phi ~ 1.618, Space O(n)
def fib(n):
    if n == 0:
        return 0
    elif n == 1:
        return 1
    return fib(n - 1) + fib(n - 2)

# Lecture 4 Counting Change: coins 50c, 20c, 10c, 5c, 1c
def first_denom(k):
    return (0, 1, 5, 10, 20, 50)[k]

def cc(amount, kinds_of_coins):
    if amount == 0:
        return 1
    elif amount < 0 or kinds_of_coins == 0:
        return 0
    else:
        return (cc(amount, kinds_of_coins - 1) +
                cc(amount - first_denom(kinds_of_coins), kinds_of_coins))

print(cc(100, 5))                    # 343 ways to make $1.00`,
        output: '343',
        keyPoints: [
          'Tree recursion splits Counting Change into two disjoint sets: ways WITHOUT the 1st coin + ways USING at least one of the 1st coin.',
          '`cc(a, k)` has Time `O(2^a)` and Space `O(a)` (longest root-to-leaf path `L = a + k`).',
          'Mutual recursion (L3): two functions call each other (`ping(n)` calls `pong(n - 1)`, `pong(n)` calls `ping(n - 1)`). Towers of Hanoi (`move_tower`) is another tree recursion with `2^n - 1` moves.',
        ],
      },
      {
        title: 'Logarithmic Divide & Conquer: `fast_expt` & Euclid\'s `gcd`',
        summary:
          'Halving the problem size each step reduces linear `O(n)` work down to logarithmic `O(log n)`.',
        code: `# Naive power(b, e): Time O(e), Space O(e)
# Fast exponentiation: b^e = (b^2)^(e/2) when e is even!
def fast_expt(b, e):
    if e == 0:
        return 1
    elif e % 2 == 0:
        return fast_expt(b * b, e // 2)  # halves e -> O(log e)!
    else:
        return b * fast_expt(b, e - 1)

# Euclid's GCD: gcd(a, b) = gcd(b, a % b), base case b == 0
def gcd(a, b):
    if b == 0:
        return a
    return gcd(b, a % b)

print(fast_expt(2, 10), gcd(206, 40))`,
        output: '1024 2',
        keyPoints: [
          '`fast_expt(b, e)` takes `O(log e)` time and `O(log e)` space (each even step halves `e`; each odd step makes the next step even).',
          'Never write `fast_expt(b, e // 2) * fast_expt(b, e // 2)` — calling it twice creates a binary tree and destroys `O(log e)` back to `O(e)`!',
          'Euclid\'s `gcd` reduces the arguments dramatically faster than checking every divisor `1..min(a, b)`.',
        ],
      },
      {
        title: 'Order of Growth (`O`, `Ω`, `Θ`) Formal Rules',
        summary:
          'Order of growth measures how time or space resources `R(n)` scale for large `n`. Drop constant factors and lower-order terms.',
        code: `# Formal definition (Lecture 3):
# R(n) = Theta(f(n))  iff  k1 * f(n) <= R(n) <= k2 * f(n)  for all n >= n0
#   O(f(n))     : upper bound  (at most k2 * f(n))
#   Omega(f(n)) : lower bound  (at least k1 * f(n))
#   Theta(f(n)) : tight bound  (sandwiched between k1*f(n) and k2*f(n))

# Simplification rules:
#   5n^2 + 100n + 999  ->  Theta(n^2)      (drop constants & smaller terms)
#   log_2(n) vs log_10(n) -> same Theta(log n) (constant factor 1/log_c(a))

# Growth hierarchy (fastest to slowest):
#   1  <  log n  <  n  <  n log n  <  n^2  <  n^3  <  Phi^n  <  2^n`,
        keyPoints: [
          'Lecture 3 analogy: downloading over bandwidth is `O(n)`; shipping a hard drive via 2-day courier is `O(1)` time regardless of file size.',
          'Logarithm base does not change order of growth because `log_a(n) = log_c(n) / log_c(a)` (a constant factor).',
          'At `10^9` steps/sec, `2^n` quickly outgrows the age of the universe (~13.7 billion years ≈ `2^59` seconds).',
        ],
        visual: 'growth',
      },
    ],
    traps: [
      {
        title: 'Tree Recursion Space Is Depth `O(n)`, NOT `O(2^n)`',
        code: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)`,
        commonGuess: 'Time O(2^n), Space O(2^n)',
        actualResult: 'Time O(Φ^n) [exponential], Space O(n) [linear!]',
        why: 'Python finishes the entire left branch `fib(n - 1)` and frees its stack frames BEFORE starting `fib(n - 2)`. Maximum active stack frames equals the deepest path from root to leaf (`n`).',
        rule: 'For tree recursion: Time ≈ total nodes/leaves in the tree; Space ≈ maximum height (depth) of the tree.',
      },
      {
        title: 'Calling `fast_expt` Twice Ruins `O(log n)`',
        code: `def slow_half_expt(b, e):
    if e == 0:
        return 1
    elif e % 2 == 0:
        return slow_half_expt(b, e // 2) * slow_half_expt(b, e // 2)
    return b * slow_half_expt(b, e - 1)`,
        commonGuess: 'Time O(log e)',
        actualResult: 'Time O(e)!',
        why: 'Each even call spawns TWO identical recursive calls of size `e/2`. Total work is `1 + 2 + 4 + ... + e ≈ 2e = O(e)`!',
        rule: 'To achieve `O(log e)`, make ONE recursive call: `fast_expt(b * b, e // 2)` or `square(fast_expt(b, e // 2))`.',
      },
      {
        title: 'Missing Base Cases Cause Infinite Recursion',
        code: `def cc_broken(amount, kinds):
    if amount == 0:
        return 1
    if kinds == 0:
        return 0
    return cc_broken(amount, kinds - 1) + cc_broken(amount - first_denom(kinds), kinds)`,
        commonGuess: 'Returns 0 when coin exceeds amount',
        actualResult: 'RecursionError: maximum recursion depth exceeded!',
        why: 'Without `elif amount < 0: return 0`, subtracting `first_denom` makes `amount` negative forever (`-5, -10, -15, ...`).',
        rule: 'Always check all boundary conditions that can overshoot the base case (e.g., `amount < 0`, `n == 0` AND `n == 1` for `fib`).',
      },
    ],
    practice: [
      {
        kind: 'mcq',
        id: 'rec-q1',
        prompt: 'What are the Time and Space orders of growth of recursive `fib(n)` (without memoization)?',
        options: [
          'Time O(n), Space O(n)',
          'Time O(Φ^n), Space O(Φ^n)',
          'Time O(Φ^n), Space O(n)',
          'Time O(n^2), Space O(1)',
        ],
        correctIdx: 2,
        explanation:
          'The number of leaves in the `fib(n)` call tree is `fib(n + 1) ≈ Φ^n / √5`, giving exponential Time `O(Φ^n)`. Because Python evaluates one branch at a time, Space is the max tree depth `O(n)`.',
      },
      {
        kind: 'bug-line',
        id: 'rec-q2',
        prompt: 'This function aims for `O(log e)` time, but actually runs in `O(e)` time. Click the line causing the slowdown:',
        lines: [
          'def fast_expt(b, e):',
          '    if e == 0:',
          '        return 1',
          '    elif e % 2 == 0:',
          '        return fast_expt(b, e // 2) * fast_expt(b, e // 2)',
          '    else:',
          '        return b * fast_expt(b, e - 1)',
        ],
        bugLineIdx: 4,
        failingCase: 'fast_expt(2, 1024) makes ~2047 calls instead of ~11',
        explanation:
          'Calling `fast_expt(b, e // 2)` twice branches into a full binary tree with `O(e)` nodes instead of a single `O(log e)` chain.',
        fix: '        return fast_expt(b * b, e // 2)   # or: half = fast_expt(b, e // 2); return half * half',
      },
      {
        kind: 'mcq',
        id: 'rec-q3',
        prompt: 'Which expression simplifies to the exact same order of growth as `R(n) = 7n² + 500n log₁₀(n) + 10000`?',
        options: ['Θ(n log n)', 'Θ(n²)', 'Θ(n² log n)', 'Θ(2ⁿ)'],
        correctIdx: 1,
        explanation:
          'Drop constant factors (`7`, `500`, `10000`) and lower-order terms (`n log n` grows slower than `n²`), leaving `Θ(n²)`.',
      },
      {
        kind: 'mcq',
        id: 'rec-q4',
        prompt: 'In Lecture 4 Counting Change `cc(amount, kinds_of_coins)`, what should `cc(0, 0)` return?',
        options: ['0', '1', 'None', 'RecursionError'],
        correctIdx: 1,
        explanation:
          'In the slide code, `if amount == 0: return 1` is checked FIRST! There is exactly 1 way to make 0 cents (use zero coins), regardless of how many coin types remain.',
      },
    ],
  },

  /* =====================================================================
   * TOPIC 3: HIGHER-ORDER FUNCTIONS & CLOSURES
   * Lecture 4 (+ Lecture 10 variadic *args)
   * ===================================================================== */
  {
    id: 'hof',
    number: 3,
    title: 'Higher-Order Functions & Closures',
    week: 'Lecture 4 (& L10 *args)',
    tagline:
      'First-class functions, sum/integral abstraction, closures, deriv & Newton\'s method, fold/fold2, and *args.',
    examFocus: 'Midterm • Final',
    examples: [
      {
        title: 'Abstracting Patterns: `sum(term, a, next, b)` & `integral`',
        summary:
          'Because functions are first-class objects in Python, we can pass `term` and `next` functions as parameters to capture summation and numerical integration in one reusable template.',
        code: `# Lecture 4 generic summation (note: shadows built-in sum if named sum):
def sum_series(term, a, next_fn, b):
    if a > b:
        return 0
    return term(a) + sum_series(term, next_fn(a), next_fn, b)

# Reuse for integers, cubes, or definite integral!
def integral(f, a, b, dx):
    def add_dx(x):               # Closure: captures dx from enclosing frame!
        return x + dx
    return sum_series(f, a + dx / 2, add_dx, b) * dx

cube = lambda x: x * x * x
print(sum_series(cube, 1, lambda x: x + 1, 3))    # 1 + 8 + 27 = 36
print(round(integral(cube, 0, 1, 0.01), 4))       # ~0.25`,
        output: `36
0.25`,
        keyPoints: [
          'First-class citizens can be: (1) named by variables, (2) passed as arguments, and (3) returned as results.',
          '`add_dx` is a closure: it remembers `dx` via a pointer to its parent frame even when invoked inside `sum_series`.',
          'Lecture 4 warning: defining `def sum(...)` overwrites Python\'s built-in `sum()` in that scope.',
        ],
      },
      {
        title: 'Functions Returning Functions: `make_x`, `deriv` & Currying',
        summary:
          'A function can construct and return a brand-new function customized by its arguments. Notice the crucial difference between a function object `f` and calling it `f()`.',
        code: `# Lecture 4: make_x returns a zero-argument function
def make_x(x):
    return lambda: x

five = make_x(5)                 # five is a FUNCTION, not 5!
print(five())                    # 5

# Lecture 4: Numerical derivative takes a function g, returns a function g'
def deriv(g):
    dx = 0.00001
    return lambda x: (g(x + dx) - g(x)) / dx

def compose(f, g):
    return lambda x: f(g(x))

print(round(deriv(lambda x: x ** 3)(5), 2))       # ~75.0
print(compose(lambda x: x * x, lambda x: x + 1)(5))`,
        output: `5
75.0
36`,
        keyPoints: [
          'Read chained calls left-to-right: `deriv(cube)(5)` first creates the derivative function, then calls it with `5`.',
          'Currying (`repeat_pattern(n, pat)` returning `npat`) lets you configure an operation once and apply it to many inputs later.',
          'Always trace what each call RETURNS — is it a number, or another function waiting for more arguments?',
        ],
        visual: 'hof',
      },
      {
        title: 'Newton\'s Method (`newtons_method` → `sqrt`)',
        summary:
          'Lecture 4 combines wishful thinking, recursion, and `deriv(g)` to find roots `g(x) = 0` iteratively using tangent-line guesses.',
        code: `def deriv(g):
    dx = 0.00001
    return lambda x: (g(x + dx) - g(x)) / dx

def newtons_method(g, first_guess):
    dg = deriv(g)
    def improve(x):
        return x - g(x) / dg(x)
    def is_close_enough(v):
        return abs(v) < 0.0001
    def attempt(guess):
        if is_close_enough(g(guess)):
            return guess
        return attempt(improve(guess))
    return attempt(first_guess)

# sqrt(a) is simply the root of g(x) = x^2 - a:
def sqrt_newton(a):
    return newtons_method(lambda x: x * x - a, a / 2)

print(round(sqrt_newton(2), 5))`,
        output: '1.41422',
        keyPoints: [
          'By solving `g(x) = x² - a = 0`, `newtons_method` computes `sqrt(a)` without writing a custom root-finding loop.',
          '`dg = deriv(g)` is computed once and captured by `improve(x)` via closure.',
        ],
      },
      {
        title: '`fold`, `fold2` & Variadic `*args` Unpacking',
        summary:
          '`fold` generalizes combining values with ANY binary operator `op` (`+`, `*`, etc.). Lecture 10 also introduces `*` to accept or unpack a variable number of arguments.',
        code: `# Lecture 4: fold2 unifies BOTH sum (base=0, +) and product (base=1, *)
def fold2(op, term, a, next_fn, b, base):
    if a > b:
        return base
    return op(term(a), fold2(op, term, next_fn(a), next_fn, b, base))

fact_4 = fold2(lambda x, y: x * y, lambda x: x, 1, lambda x: x + 1, 4, 1)

# Lecture 10: * collects extra positional args into a tuple, or unpacks a sequence
def collect(x, y, *z):
    return (x, y, z)

def nmap(fn, *seqs):
    return tuple(fn(*items) for items in zip(*seqs))

print(fact_4)
print(collect(1, 2, 3, 4))
print(nmap(lambda a, b: a + b, (1, 2, 3), (10, 20, 30)))`,
        output: `24
(1, 2, (3, 4))
(11, 22, 33)`,
        keyPoints: [
          'In `fold2`, `base` must be the identity element of `op`: `0` for addition, `1` for multiplication.',
          'In `def f(x, y, *z):`, `z` is ALWAYS a `tuple` (even `()` if no extra args are passed).',
          'In a function call `fn(*args)`, `*` unpacks the tuple/list `args` into separate positional arguments.',
        ],
      },
    ],
    traps: [
      {
        title: 'Forgetting to Call a Returned Function (`five` vs `five()`)',
        code: `def make_x(x):
    return lambda: x

five = make_x(5)
print(five + 1)`,
        commonGuess: '6',
        actualResult: "TypeError: unsupported operand type(s) for +: 'function' and 'int'",
        why: '`make_x(5)` returns a function object, NOT the integer `5`. You must call `five()` to get `5`.',
        rule: 'Track the type of every expression! If a function returns a `lambda`, you need another `(...)` call to get its result.',
      },
      {
        title: 'Wrong Identity `base` in `fold2`',
        code: `def product(a, b):
    return fold2(lambda x, y: x * y,
                 lambda x: x, a, lambda x: x + 1, b, 0)

print(product(1, 5))`,
        commonGuess: '120',
        actualResult: '0',
        why: 'When `a > b`, `fold2` returns `base = 0`, so the recursion computes `1 * 2 * 3 * 4 * 5 * 0 = 0`!',
        rule: 'Match `base` to `op`: `0` for `+`, `1` for `*`, `()` for tuple concatenation, `""` for string concatenation.',
      },
      {
        title: 'Late Binding of Loop Variables in Closures',
        code: `funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])`,
        commonGuess: '[0, 1, 2]',
        actualResult: '[2, 2, 2]',
        why: 'Each lambda captures the variable `i` (not its value at creation time). When called after the loop ends, `i` is `2` for all three.',
        rule: 'Capture the current value via a wrapper factory `make_x(i)` or default parameter `lambda i=i: i`.',
      },
    ],
    practice: [
      {
        kind: 'mcq',
        id: 'hof-q1',
        prompt: 'What does this Lecture 4 style expression evaluate to?',
        code: `def twice(f):
    return lambda x: f(f(x))

inc = lambda x: x + 1
print(twice(twice)(inc)(5))`,
        options: ['7', '9', '13', '21'],
        correctIdx: 1,
        explanation:
          '`twice(twice)` applies `twice` twice: `twice(twice(inc))` applies `inc` `2 * 2 = 4` times (`5 + 4 = 9`). (Bonus: `twice(twice(twice))(inc)(5)` would apply `inc` `2^(2^2) = 16` times!)',
      },
      {
        kind: 'mcq',
        id: 'hof-q2',
        prompt: 'What does this call to Lecture 4\'s `fold2` return?',
        code: `def fold2(op, term, a, next_fn, b, base):
    if a > b:
        return base
    return op(term(a), fold2(op, term, next_fn(a), next_fn, b, base))

print(fold2(lambda x, y: x * y, lambda x: x, 1, lambda x: x + 1, 4, 0))`,
        options: ['24', '10', '0', 'TypeError'],
        correctIdx: 2,
        explanation:
          'Because `base` is `0` instead of `1`, the base case multiplies the whole product by `0`, returning `0`.',
      },
      {
        kind: 'bug-line',
        id: 'hof-q3',
        prompt: 'Click the buggy line in this recursive `sum_series` higher-order function:',
        lines: [
          'def sum_series(term, a, next_fn, b):',
          '    if a > b:',
          '        return 0',
          '    else:',
          '        return term(a) + sum_series(term(a), next_fn(a), next_fn, b)',
        ],
        bugLineIdx: 4,
        failingCase: "sum_series(lambda x: x, 1, lambda x: x + 1, 3) -> TypeError: 'int' object is not callable",
        explanation:
          'The recursive call passes `term(a)` (a number) instead of the function `term` itself, so the next step tries to call an `int`!',
        fix: '        return term(a) + sum_series(term, next_fn(a), next_fn, b)',
      },
      {
        kind: 'mcq',
        id: 'hof-q4',
        prompt: 'Given `def f(x, y, *z): return z`, what does `f(10, 20, 30, 40)` return?',
        options: ['[30, 40]', '(30, 40)', '30', 'TypeError'],
        correctIdx: 1,
        explanation:
          'The variadic parameter `*z` (Lecture 10) collects all extra positional arguments into a `tuple`: `(30, 40)`.',
      },
    ],
  },

  /* =====================================================================
   * TOPIC 4: DATA ABSTRACTION, SEQUENCES, TREES & FILES
   * Lectures 5 & 6
   * ===================================================================== */
  {
    id: 'sequences-trees',
    number: 4,
    title: 'Data Abstraction, Sequences, Trees & Files',
    week: 'Lectures 5–6',
    tagline:
      'Abstraction barriers, == vs is, tuples & O(n²) concat cost, nested tuple trees, Signal Processing, and File I/O.',
    examFocus: 'Midterm • PE • Final',
    examples: [
      {
        title: 'Data Abstraction Barrier & `==` vs `is`',
        summary:
          'An Abstract Data Type (ADT) separates how data is used from how it is represented via Constructors, Selectors, Predicates, and Printers. Never cross the abstraction barrier!',
        code: `# Rational Number ADT (Lecture 5/6):
def make_rat(n, d):              # Constructor
    return (n, d)

def numer(r): return r[0]        # Selector (Accessor)
def denom(r): return r[1]        # Selector (Accessor)

def add_rat(x, y):               # Uses ONLY constructors & selectors!
    return make_rat(numer(x) * denom(y) + numer(y) * denom(x),
                    denom(x) * denom(y))

# Equivalence (==) vs Identity (is):
a = (1, 2, 3)
b = tuple(x for x in (1, 2, 3))
print(a == b, a is b)            # True, False (equal values, different objects)`,
        output: 'True False',
        keyPoints: [
          '4 ADT operation categories: Constructors (build), Selectors/Accessors (extract), Predicates (test true/false), Printers (display).',
          'Never write `x[0]` inside `add_rat(x, y)` — if `make_rat` switches from `tuple` to `dict`, code respecting the barrier still works!',
          '`==` checks value equivalence; `is` checks whether two variables point to the exact same object in memory.',
        ],
      },
      {
        title: 'Tuples, `O(n²)` Concat Cost & Nested Tuple Trees',
        summary:
          'Tuples are immutable sequences. Because `tuple1 + tuple2` copies BOTH tuples in `len(t1) + len(t2)` steps, building tuples one element at a time takes `O(n²)` time! Nested tuples represent trees.',
        code: `# Single-element tuple MUST have a trailing comma:
single = (4,)                    # tuple; (4) is just int 4!

# Lecture 6: Recursive tuple reverse -> Time O(n^2), Space O(n^2)
# Iterative tuple reverse            -> Time O(n^2), Space O(n)
def reverse_iter(seq):
    res = ()
    for item in seq:
        res = (item,) + res      # copies entire res every iteration -> O(n^2) time!
    return res

# Trees as nested tuples (closure property):
def is_leaf(item):
    return type(item) != tuple

def count_leaves(tree):
    if tree == ():
        return 0
    elif is_leaf(tree):
        return 1
    else:
        return count_leaves(tree[0]) + count_leaves(tree[1:])

t = ((1, 2), 3, (4, (5,)))
print(reverse_iter((1, 2, 3)), count_leaves(t))`,
        output: '(3, 2, 1) 5',
        keyPoints: [
          '`tuple1 + tuple2` takes `len(tuple1) + len(tuple2)` steps — summing `1 + 2 + ... + n` gives `O(n²)` time.',
          'Recursive `reverse(seq)` holds `n` slices (`seq[1:]`) simultaneously on the heap + stack frames, using `O(n²)` Space; iterative `reverse` reuses `res`, using `O(n)` Space.',
          'Tree recursion pattern: handle (1) empty tuple `()`, (2) leaf (`type(x) != tuple`), and (3) combine `tree[0]` with `tree[1:]` (or `map` over subtrees, as in `scale_tree` / `copy_tree`).',
        ],
      },
      {
        title: 'Signal-Processing View: Enumerate, Filter, Map, Accumulate',
        summary:
          'Lecture 6 decomposes sequence problems into four composable stages: Enumerate (generate/flatten) → Filter → Map → Accumulate.',
        code: `# Lecture 6 Signal-Processing primitives:
def accumulate(fn, initial, seq):
    if seq == ():
        return initial
    return fn(seq[0], accumulate(fn, initial, seq[1:]))

def enumerate_tree(tree):        # flattens nested tuple tree to 1D tuple
    if tree == ():
        return ()
    elif type(tree) != tuple:
        return (tree,)
    return enumerate_tree(tree[0]) + enumerate_tree(tree[1:])

# Pipeline: sum of squares of odd leaves in a tree
def sum_odd_squares(tree):
    leaves = enumerate_tree(tree)
    odds = tuple(filter(lambda x: x % 2 == 1, leaves))
    sq = tuple(map(lambda x: x * x, odds))
    return accumulate(lambda x, y: x + y, 0, sq)

print(sum_odd_squares(((1, 2), (3, 4), 5)))     # 1^2 + 3^2 + 5^2 = 35`,
        output: '35',
        keyPoints: [
          'Built-in `map(fn, seq)` and `filter(pred, seq)` return ONE-TIME-USE iterables — convert with `tuple(...)` or `list(...)` if you need to reuse them.',
          'Generator/tuple comprehension equivalent: `tuple(x * x for x in leaves if x % 2 == 1)`.',
          'Note the argument order in Lecture 6\'s `accumulate`: `fn(seq[0], accumulate(fn, initial, seq[1:]))` (right-to-left fold).',
        ],
      },
      {
        title: 'Working with Files (`open`, `readline`, `write`)',
        summary:
          'Lecture 6 reads text files line by line using `open` and `readline()`. End-of-file (EOF) is signaled by the empty string `""` (not `"\\n"`).',
        code: `# Reading a file line by line (Lecture 6 pattern):
def count_lines(filename):
    f = open(filename, 'r')
    count = 0
    line = f.readline()
    while line != '':            # '' marks EOF (blank line is '\\n'!)
        count += 1
        line = f.readline()
    f.close()
    return count

# Writing to a file ('w' overwrites existing content!):
# out = open('output.txt', 'w')
# out.write('CS1010A\\n')
# out.close()`,
        keyPoints: [
          'Every non-EOF line ends with `"\\n"` (except possibly the last line) — strip it with `line.strip()` when parsing data.',
          'A blank line in a file is `"\\n"` (non-empty); only true End-Of-File returns `""`.',
          'Always close files with `f.close()` (or use `with open(...) as f:`).',
        ],
      },
    ],
    traps: [
      {
        title: 'Built-in `map` and `filter` Are One-Time-Use Iterables',
        code: `a = (1, 2, 3)
b = map(lambda x: x * 2, a)
print(tuple(b))
print(tuple(b))`,
        commonGuess: '(2, 4, 6) then (2, 4, 6)',
        actualResult: `(2, 4, 6)
()`,
        why: 'In Python 3, `map` and `filter` return lazy iterators that exhaust on the first pass. The second `tuple(b)` sees nothing left and returns `()`!',
        rule: 'Store `b = tuple(map(...))` immediately if you will inspect or loop over the result more than once.',
      },
      {
        title: 'Single-Element Tuple Missing Comma `(4)`',
        code: `t = (1, 2)
t = t + (3)
print(t)`,
        commonGuess: '(1, 2, 3)',
        actualResult: 'TypeError: can only concatenate tuple (not "int") to tuple',
        why: 'Parentheses around a single value `(3)` are just grouping, NOT a tuple! Only `(3,)` with a comma creates a 1-element tuple.',
        rule: 'Always put a trailing comma for 1-element tuples: `(x,)`. Also never concatenate a `tuple` with a `list`.',
      },
      {
        title: 'Recursive Tuple Slicing Costs `O(n²)` Space, Not `O(n)`',
        code: `def reverse_rec(seq):
    if seq == ():
        return ()
    return reverse_rec(seq[1:]) + (seq[0],)`,
        commonGuess: 'Time O(n), Space O(n)',
        actualResult: 'Time O(n²), Space O(n²)!',
        why: 'Each call slices `seq[1:]` (creating tuples of lengths `n-1, n-2, ..., 1` that ALL stay alive on the heap until recursion unwinds) AND concatenates tuples in `O(k)` time.',
        rule: 'Tuple slicing `seq[1:]` and concatenation `t1 + t2` each cost `O(len)`! Iterative tuple building drops Space to `O(n)` but Time is still `O(n²)`.',
      },
    ],
    practice: [
      {
        kind: 'mcq',
        id: 'seq-q1',
        prompt: 'What does this Lecture 6 snippet print?',
        code: `nums = (1, 2, 3, 4)
evens = filter(lambda x: x % 2 == 0, nums)
print(len(tuple(evens)), tuple(evens))`,
        options: ['2 (2, 4)', '2 ()', '0 ()', 'TypeError'],
        correctIdx: 1,
        explanation:
          '`tuple(evens)` inside `len(...)` exhausts the `filter` iterator (length `2`). The second `tuple(evens)` has nothing left and produces `()`.',
      },
      {
        kind: 'mcq',
        id: 'seq-q2',
        prompt: 'Compare Recursive vs. Iterative `scale_seq(seq, factor)` on an `n`-element `tuple` (Lecture 6). What are their Time and Space complexities?',
        options: [
          'Recursive: O(n) time, O(n) space | Iterative: O(n) time, O(1) space',
          'Recursive: O(n²) time, O(n²) space | Iterative: O(n²) time, O(n) space',
          'Recursive: O(n²) time, O(n) space | Iterative: O(n) time, O(n) space',
          'Both are O(n) time and O(n) space',
        ],
        correctIdx: 1,
        explanation:
          'Because tuples are immutable, every `+` copies the tuple (`O(n²)` total time for both). The recursive version also keeps all `seq[1:]` slices alive simultaneously (`O(n²)` space), while the iterative version only keeps the current result tuple (`O(n)` space).',
      },
      {
        kind: 'bug-line',
        id: 'seq-q3',
        prompt: 'Click the buggy line in this nested-tuple `count_leaves(tree)` function:',
        lines: [
          'def count_leaves(tree):',
          '    if tree == ():',
          '        return 0',
          '    elif type(tree) != tuple:',
          '        return 1',
          '    else:',
          '        return count_leaves(tree[0]) + count_leaves(tree[1])',
        ],
        bugLineIdx: 6,
        failingCase: 'count_leaves((1, 2, 3)) -> 2 instead of 3 (and crashes on 1-element tuple (1,))',
        explanation:
          '`tree[1]` only grabs the second element instead of the rest of the tuple! It skips element 3 and raises `IndexError` on 1-element tuples like `(5,)`.',
        fix: '        return count_leaves(tree[0]) + count_leaves(tree[1:])',
      },
      {
        kind: 'mcq',
        id: 'seq-q4',
        prompt: 'Given `make_rat(n, d)`, `numer(r)`, `denom(r)`, which implementation of `mul_rat(x, y)` RESPECTS the Data Abstraction Barrier?',
        options: [
          'return (x[0] * y[0], x[1] * y[1])',
          'return make_rat(x[0] * y[0], x[1] * y[1])',
          'return (numer(x) * numer(y), denom(x) * denom(y))',
          'return make_rat(numer(x) * numer(y), denom(x) * denom(y))',
        ],
        correctIdx: 3,
        explanation:
          'Respecting the abstraction barrier means using ONLY constructors (`make_rat`) and selectors (`numer`, `denom`), never indexing `[0]/[1]` or constructing raw tuples directly.',
      },
    ],
  },

  /* =====================================================================
   * TOPIC 5: LISTS, MUTATION, SEARCHING & SORTING
   * Lecture 7
   * ===================================================================== */
  {
    id: 'lists-search-sort',
    number: 5,
    title: 'Lists, Mutation, Searching & Sorting',
    week: 'Lecture 7',
    tagline:
      'Mutable lists, del & shallow copy(), += vs = +, Linear & Binary Search, Selection Sort, Merge Sort, and lst.sort().',
    examFocus: 'PE • Final',
    examples: [
      {
        title: 'List Mutation, `del`, Shallow `copy()` & `+=`',
        summary:
          'Unlike tuples and strings, Python lists are mutable. Most list methods mutate in-place and return `None`; `copy()` makes a shallow copy that shares nested mutable items.',
        code: `# Mutating methods returning None:
#   append(x), extend(seq), insert(pos, x), remove(x), clear(), reverse(), sort()
# Mutating method returning a value:
#   pop(pos)  (defaults to last item)
# Statement (NO parentheses, NO return value):
#   del a[0]  |  del a[:]  |  del a

# Shallow copy shares inner lists (Lecture 7):
a = [[1, 2], [3, 4]]
c = a.copy()
c[0].append(99)
print(a, c[0] is a[0])           # [[1, 2, 99], [3, 4]] True

# += differs from = + ONLY for mutable types!
x = [1, 2]; y = x
x += [3]                         # mutates in-place (like extend)! y sees [1, 2, 3]
t1 = (1, 2); t2 = t1
t1 += (3,)                       # creates NEW tuple! t2 stays (1, 2)
print(y, t2)`,
        output: `[[1, 2, 99], [3, 4]] True
[1, 2, 3] (1, 2)`,
        keyPoints: [
          '`append([4, 5])` adds ONE list element (`[1, 2, [4, 5]]`); `extend([4, 5])` adds each element (`[1, 2, 4, 5]`).',
          '`remove(x)` deletes only the FIRST matching value (raises `ValueError` if missing). `del a` deletes the variable name, not the list object if another variable aliases it.',
          '`seq * n` requires integer `n` (`n <= 0` gives empty sequence). For 2D grids, NEVER write `[[0]*3]*3` — use `[[0]*3 for _ in range(3)]`.',
        ],
        visual: 'memory',
      },
      {
        title: 'Linear Search & Non-Slicing Binary Search',
        summary:
          'Linear search checks every element in `O(n)`. On a SORTED ascending list, Binary Search halves the search range each step in `O(log n)` — provided you use `low`/`high` indices instead of slicing!',
        code: `# Linear Search: works on ANY list, Time O(n)
def linear_search(key, lst):
    for item in lst:
        if item == key:
            return True
    return False

# Lecture 7 Binary Search (non-slicing helper -> Time O(log n)):
def binary_search(key, seq):
    def helper(low, high):
        if low > high:
            return False
        mid = (low + high) // 2
        if key == seq[mid]:
            return True
        elif key < seq[mid]:
            return helper(low, mid - 1)
        else:
            return helper(mid + 1, high)
    return helper(0, len(seq) - 1)

print(binary_search(58, [7, 14, 21, 35, 42, 58, 70]))`,
        output: 'True',
        keyPoints: [
          'Precondition: Binary Search ONLY works on a sorted list — on an unsorted list it can return `False` even when the key exists!',
          'Slicing `seq[:mid]` / `seq[mid+1:]` copies half the list at every call, degrading Binary Search from `O(log n)` to `O(n)` time and space.',
          'Always move `low = mid + 1` and `high = mid - 1` so the range strictly shrinks and never loops forever.',
        ],
        visual: 'bsearch',
      },
      {
        title: 'Selection Sort & Merge Sort (Lecture 7 Syllabus)',
        summary:
          'CS1010A Lecture 7 teaches TWO sorting algorithms: Selection Sort (`O(n²)`) and Merge Sort (`O(n log n)`). Know both implementations, their stability, and in-place status.',
        code: `# Lecture 7 Selection Sort: Best/Avg/Worst O(n^2) | In-place: NO | Stable: YES
def selection_sort(lst):
    res = []
    while lst:
        smallest = lst[0]
        for x in lst:
            if x < smallest:     # strict < keeps first equal item -> STABLE!
                smallest = x
        lst.remove(smallest)
        res.append(smallest)
    return res

# Lecture 7 Merge Sort: Best/Avg/Worst O(n log n) | In-place: NO | Stable: YES
def merge(left, right):
    res, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:  # <= picks left first on ties -> STABLE!
            res.append(left[i]); i += 1
        else:
            res.append(right[j]); j += 1
    return res + left[i:] + right[j:]

def merge_sort(lst):
    if len(lst) < 2:
        return lst
    mid = len(lst) // 2
    return merge(merge_sort(lst[:mid]), merge_sort(lst[mid:]))`,
        keyPoints: [
          'Selection Sort (Lecture 7 version): builds a new list `res` (NOT in-place), uses strict `<` (STABLE), and takes `O(n²)` in Best, Average, AND Worst cases.',
          'Merge Sort: splits in half (`log n` levels) and merges each level in `O(n)` → `O(n log n)` in Best, Average, and Worst cases; NOT in-place; STABLE because `left[i] <= right[j]`.',
          'Stable sort definition: equal elements preserve their original relative order from the input.',
        ],
      },
      {
        title: 'Built-in `lst.sort(key=, reverse=)` & `sorted()`',
        summary:
          'Python\'s built-in Timsort is `O(n log n)` and STABLE. `lst.sort()` mutates in-place and returns `None`; `sorted(seq)` returns a new sorted list.',
        code: `# Lecture 7 Slide 70: Stability STILL holds when reverse=True!
a = [1, 4, 2, 34, 10]
a.sort(key=lambda x: x % 5, reverse=True)
print(a)                         # [4, 34, 2, 1, 10] -> 4 stays BEFORE 34!

# Sorting tuple records (name, grade, age) by age:
students = [('john', 'A', 15), ('jane', 'B', 12), ('dave', 'B', 10)]
by_age = sorted(students, key=lambda s: s[2])
print(by_age)`,
        output: `[4, 34, 2, 1, 10]
[('dave', 'B', 10), ('jane', 'B', 12), ('john', 'A', 15)]`,
        keyPoints: [
          'Even with `reverse=True`, Python\'s sort is stable: `4 % 5 == 34 % 5 == 4`, and `4` appeared before `34`, so `4` STILL comes before `34`!',
          'Multi-key sorting uses tuple keys: `key=lambda s: (s[1], -s[2])` sorts by grade ASC, then age DESC.',
          '`sorted(seq)` works on tuples, strings, lists, and dicts, and ALWAYS returns a new `list`.',
        ],
      },
    ],
    traps: [
      {
        title: 'Assigning `lst = lst.sort()` or `b = del a[0]`',
        code: `nums = [3, 1, 2]
nums = nums.sort()
print(nums)
# Also: b = del nums[0]  -> SyntaxError!`,
        commonGuess: '[1, 2, 3]',
        actualResult: 'None (and `b = del a[0]` is a SyntaxError!)',
        why: '`sort()`, `append()`, `extend()`, `insert()`, `remove()`, `reverse()`, `clear()` all mutate in-place and return `None`. `del` is a statement with no return value at all.',
        rule: 'Call `nums.sort()` on its own line (never `nums = nums.sort()`), or use `nums = sorted(nums)`.',
      },
      {
        title: '`a += [3]` vs `a = a + [3]` With an Alias',
        code: `a = [1, 2]
b = a
a += [3]        # mutates the shared list!
a = a + [4]     # rebinds a to a NEW list!
print(a, b)`,
        commonGuess: '[1, 2, 3, 4] [1, 2, 3, 4]  (or both [1, 2])',
        actualResult: '[1, 2, 3, 4] [1, 2, 3]',
        why: 'On lists, `a += [3]` mutates in-place (just like `a.extend([3])`), so alias `b` sees `3`. Then `a = a + [4]` creates a NEW list and rebinds only `a`, leaving `b` at `[1, 2, 3]`.',
        rule: 'For lists, `+=` mutates in-place; `= ... + ...` creates a new list. For tuples, BOTH create a new tuple.',
      },
      {
        title: 'Shallow Copy & `[[0] * 3] * 3` Row Aliasing',
        code: `grid = [[0] * 3] * 3
grid[0][1] = 9
print(grid)`,
        commonGuess: '[[0, 9, 0], [0, 0, 0], [0, 0, 0]]',
        actualResult: '[[0, 9, 0], [0, 9, 0], [0, 9, 0]]',
        why: '`* 3` copies the SAME inner list reference 3 times (shallow repetition). Mutating `grid[0]` mutates all 3 rows.',
        rule: 'Always build nested lists with a comprehension: `[[0] * 3 for _ in range(3)]`.',
      },
      {
        title: 'Slicing Inside Binary Search Destroys `O(log n)`',
        code: `def bsearch_slice(key, seq):
    if not seq: return False
    mid = len(seq) // 2
    if key == seq[mid]: return True
    elif key < seq[mid]: return bsearch_slice(key, seq[:mid])
    else: return bsearch_slice(key, seq[mid + 1:])`,
        commonGuess: 'Time O(log n)',
        actualResult: 'Time O(n), Space O(n)!',
        why: 'Slicing copies `n/2 + n/4 + n/8 + ... = n` elements in total! The copying cost dominates the `O(log n)` comparisons.',
        rule: 'Pass `(low, high)` indices into `helper(low, high)` instead of slicing the sequence.',
      },
    ],
    practice: [
      {
        kind: 'mcq',
        id: 'list-q1',
        prompt: 'What does this Lecture 7 aliasing snippet print?',
        code: `a = [1, 2]
b = a
a += [3]
a = a + [4]
print(b)`,
        options: ['[1, 2]', '[1, 2, 3]', '[1, 2, 3, 4]', 'TypeError'],
        correctIdx: 1,
        explanation:
          '`a += [3]` mutates the list shared by `a` and `b` in-place (`[1, 2, 3]`). `a = a + [4]` then creates a brand-new list and rebinds only `a`, so `b` remains `[1, 2, 3]`.',
      },
      {
        kind: 'mcq',
        id: 'list-q2',
        prompt: 'In Lecture 7\'s implementations of Selection Sort and Merge Sort, which statement is TRUE?',
        options: [
          'Selection Sort is O(n) in the best case and in-place',
          'Merge Sort is O(n²) in the worst case and in-place',
          'Both Lecture 7 implementations are STABLE and NOT in-place; Selection Sort is O(n²) and Merge Sort is O(n log n)',
          'Selection Sort is unstable while Merge Sort is stable and in-place',
        ],
        correctIdx: 2,
        explanation:
          'Lecture 7\'s Selection Sort builds a new `res` list using strict `<` (not in-place, stable, always `O(n²)`). Merge Sort builds new merged lists using `<=` (not in-place, stable, always `O(n log n)`).',
      },
      {
        kind: 'bug-line',
        id: 'list-q3',
        prompt: 'Click the line that causes an infinite recursion when searching for a missing key:',
        lines: [
          'def bsearch(key, seq):',
          '    def helper(low, high):',
          '        if low > high:',
          '            return False',
          '        mid = (low + high) // 2',
          '        if key == seq[mid]:',
          '            return True',
          '        elif key < seq[mid]:',
          '            return helper(low, mid)',
          '        else:',
          '            return helper(mid + 1, high)',
          '    return helper(0, len(seq) - 1)',
        ],
        bugLineIdx: 8,
        failingCase: 'bsearch(1, [5, 10, 20]) -> low=0, high=0, mid=0 loops forever!',
        explanation:
          'Since `seq[mid]` was already checked and `key < seq[mid]`, keeping `high = mid` fails to shrink `[0, 0]` when `low == high == mid`.',
        fix: '            return helper(low, mid - 1)',
      },
      {
        kind: 'mcq',
        id: 'list-q4',
        prompt: 'What does `a` become after running this Lecture 7 Slide 70 snippet?',
        code: `a = [1, 4, 2, 34, 10]
a.sort(key=lambda x: x % 5, reverse=True)
print(a)`,
        options: [
          '[34, 4, 2, 1, 10]',
          '[4, 34, 2, 1, 10]',
          '[10, 1, 2, 4, 34]',
          'None',
        ],
        correctIdx: 1,
        explanation:
          'Keys (`x % 5`) are `[1, 4, 2, 4, 0]`. Descending order of keys is `4, 4, 2, 1, 0`. Because Python\'s `sort` is STABLE even when `reverse=True`, `4` stays before `34` → `[4, 34, 2, 1, 10]`.',
      },
    ],
  },

  /* =====================================================================
   * TOPIC 6: DICTIONARIES, DATA STRUCTURES & DATA PIVOTING
   * Lectures 8 & 11
   * ===================================================================== */
  {
    id: 'dicts-ds-pivoting',
    number: 6,
    title: 'Dictionaries, Data Structures & Pivoting',
    week: 'Lectures 8 & 11',
    tagline:
      'Dictionaries, Nim & LIFO Stacks, Multiset 4-representation comparison, and PE Q2 CSV pivoting, binning & Top-K.',
    examFocus: 'PE (Q2) • Final',
    examples: [
      {
        title: 'Python Dictionaries (`{}`) & Core Operations',
        summary:
          'Dictionaries map unique immutable keys to values with average `O(1)` lookup, insertion, and deletion — making them the workhorse for counting, grouping, and PE Q2.',
        code: `d = {'a': 0, 'b': 1}             # or dict(a=0, b=1) or dict([('a', 0)])
d['c'] = 2                       # insert / update in O(1)
del d['b']                       # delete key (KeyError if missing)

print('a' in d, 0 in d)          # True False -> 'in' checks KEYS only!
print(d.get('z', -1))            # -1 (safe lookup, no KeyError)

# Iterating over keys or (key, value) pairs:
for k, v in d.items():
    print(k, '->', v)`,
        output: `True False
-1
a -> 0
c -> 2`,
        keyPoints: [
          'Tuple vs List vs Dict: Tuple = immutable ordered; List = mutable ordered (`O(n)` search); Dict = mutable key-value (`O(1)` key lookup).',
          'Keys must be immutable/hashable (`int`, `str`, `tuple` of immutables). Using a `list` as a dict key raises `TypeError: unhashable type`.',
          'Use `d.get(k, default)` instead of `d[k]` whenever a key might not exist yet.',
        ],
      },
      {
        title: 'Data Structure Design: Nim & Stack (LIFO)',
        summary:
          'Lecture 8 distinguishes Specification (the contract: Constructors, Selectors, Predicates, Printers) from Implementation (internal representation + constraints).',
        code: `# Game of Nim (Lecture 8): representation constraints matter!
# Bad representation: 10 * n + m  -> BREAKS when pile 2 has >= 10 coins!
# Better representation: tuple (n, m)

# LIFO Stack ADT implemented with a Python list (for Nim undo):
def make_stack():
    return []

def is_empty(s):
    return s == []

def push(s, item):
    s.append(item)               # O(1)

def pop(s):
    if is_empty(s):
        return None
    return s.pop()               # O(1), removes & returns top item

stk = make_stack()
push(stk, (3, 5)); push(stk, (3, 2))
print(pop(stk), pop(stk), pop(stk))`,
        output: '(3, 2) (3, 5) None',
        keyPoints: [
          'A Stack is Last-In, First-Out (LIFO): `push` and `pop` operate at the same end (`append`/`pop()` in `O(1)`).',
          'Always check representation constraints: e.g., `denom != 0` for rationals, comparable items for Ordered Lists/BSTs, `m < 10` for `10*n + m`.',
        ],
      },
      {
        title: 'Multiple Representations: Multiset (MSet) 4-Way Comparison',
        summary:
          'Lecture 8 implements the exact same Multiset (bag) ADT four different ways to compare their time complexities and trade-offs.',
        code: `# Multiset ADT ops: adjoin_mset(x, s), multiplicity_of(x, s), intersection_of(s1, s2)
# 1. Unordered List: [1, 2, 1]              -> adjoin O(1),  mult O(n),     inter O(n^2)
# 2. Ordered List:   [1, 1, 2]              -> adjoin O(n),  mult O(log n), inter O(n + m)
# 3. BST: [entry, left, right], [x, count]  -> adjoin O(log n), mult O(log n), inter O(i + j)
# 4. Dictionary:     {1: 2, 2: 1}           -> adjoin O(1),  mult O(1),     inter O(i)

# Dictionary Multiset (fastest overall, requires hashable elements):
def adjoin_mset(x, s):
    s[x] = s.get(x, 0) + 1
    return s

def multiplicity_of(x, s):
    return s.get(x, 0)

def intersection_of(s1, s2):
    res = {}
    for k in s1:
        if k in s2:
            res[k] = min(s1[k], s2[k])
    return res`,
        keyPoints: [
          'In BST/Dict intersection, `i` and `j` denote the number of UNIQUE elements (not total elements `n, m`).',
          'Ordered List & BST require elements to be comparable (`<`); BST `O(log n)` assumes a BALANCED tree (an unbalanced tree degrades to `O(n)`).',
          'BST intersection extracts sorted unique items via in-order traversal (left → entry → right), then merges in `O(i + j)`.',
        ],
        visual: 'mset',
      },
      {
        title: 'PE Q2 Data Processing: Pivoting, `delta`, `mavg` & Top-K',
        summary:
          'Lecture 11 converts messy/long-form tables into dict-of-dicts, computes daily `delta`, moving averages `mavg`, bins, and ranks results — using pure Python (NumPy/Pandas/Matplotlib CANNOT be used in PE!).',
        code: `# Pivoting long-form rows [(date, country, cases), ...] -> dict-of-dicts:
rows = [('D1', 'SG', 10), ('D2', 'SG', 15), ('D1', 'MY', 20), ('D2', 'MY', 32)]
by_country = {}
for date, country, val in rows:
    if country not in by_country:
        by_country[country] = []
    by_country[country].append(val)

# Lecture 11 helpers: daily delta & n-day moving average
def delta(seq):
    return [seq[i] - seq[i - 1] for i in range(1, len(seq))]

def mavg(seq, n):
    return [sum(seq[i:i + n]) / n for i in range(len(seq) - n + 1)]

# PE Q2 Top-K INCLUDING ties at the k-th cutoff:
scores = [('Amy', 90), ('Ben', 95), ('Cho', 90), ('Dan', 80)]
ranked = sorted(scores, key=lambda r: (-r[1], r[0]))
cutoff = ranked[1][1]            # k = 2 -> cutoff score is 90
top2_with_ties = [r for r in ranked if r[1] >= cutoff]
print(by_country['SG'], delta([10, 15, 24]), top2_with_ties)`,
        output: `[10, 15] [5, 9] [('Ben', 95), ('Amy', 90), ('Cho', 90)]`,
        keyPoints: [
          'Lecture 11 explicitly warns: Matplotlib, NumPy, Pandas, and Seaborn are for visualisation overview and CANNOT be used in the Practical Exam (PE).',
          'Use `zip(*rows)` to transpose rows into columns (e.g., wide-form CSV table → per-column tuples).',
          'Counting into fixed bins (L11): `bins = [0] * 61; bins[val] += 1` gives an `O(1)` frequency histogram.',
        ],
      },
    ],
    traps: [
      {
        title: '`x in dict` Checks KEYS, Not Values',
        code: `d = {'a': 0, 'b': 1}
print(0 in d)
print('a' in d)`,
        commonGuess: 'True then True',
        actualResult: `False
True`,
        why: 'Dictionary membership (`in`) only searches the keys (`"a"`, `"b"`), NOT the values (`0`, `1`). To check values, write `0 in d.values()` (`O(n)`).',
        rule: '`k in d` is `O(1)` and checks KEYS only; `v in d.values()` is `O(n)`.',
      },
      {
        title: '`KeyError` When Incrementing Unseen Keys',
        code: `counts = {}
for ch in "abca":
    counts[ch] += 1`,
        commonGuess: "{'a': 2, 'b': 1, 'c': 1}",
        actualResult: "KeyError: 'a'",
        why: '`counts["a"] += 1` tries to read `counts["a"]` before it exists in the dictionary.',
        rule: 'Always write `counts[ch] = counts.get(ch, 0) + 1` (or initialize with `if ch not in counts:`).',
      },
      {
        title: 'Using `ranked[:k]` Drops Ties at the k-th Position',
        code: `ranked = [('Ben', 95), ('Amy', 90), ('Cho', 90), ('Dan', 80)]
print(ranked[:2])`,
        commonGuess: "Includes everyone tied for 2nd place",
        actualResult: "[('Ben', 95), ('Amy', 90)]  (Cho is unfairly cut off!)",
        why: 'Slicing `[:k]` takes strictly `k` items even when item `k` and item `k+1` have the exact same score.',
        rule: 'Check if PE Q2 specifies "including ties": if `len(ranked) > k`, take `cutoff = ranked[k - 1][score_idx]` and keep all rows with `score >= cutoff`.',
      },
    ],
    practice: [
      {
        kind: 'mcq',
        id: 'dict-q1',
        prompt: 'What does this Lecture 8 snippet print?',
        code: `d = {'x': 10, 'y': 20}
print(10 in d, 'x' in d, d.get('z', 0))`,
        options: ['True True 0', 'False True 0', 'False True None', 'KeyError'],
        correctIdx: 1,
        explanation:
          '`10 in d` is `False` because `in` checks keys (`"x"`, `"y"`), not values. `\'x\' in d` is `True`, and `d.get(\'z\', 0)` safely returns default `0`.',
      },
      {
        kind: 'mcq',
        id: 'dict-q2',
        prompt: 'In Lecture 8\'s Multiset comparison, which representation achieves `O(1)` `adjoin_mset`, `O(1)` `multiplicity_of`, and `O(i)` `intersection_of`?',
        options: [
          'Unordered List',
          'Ordered List',
          'Binary Search Tree',
          'Dictionary',
        ],
        correctIdx: 3,
        explanation:
          'Mapping `{element: count}` in a Dictionary gives `O(1)` adjoin and multiplicity, and `O(i)` intersection (looping over the `i` unique keys of `s1` and checking `k in s2` in `O(1)`).',
      },
      {
        kind: 'bug-line',
        id: 'dict-q3',
        prompt: 'Click the line that will raise a `KeyError` when pivoting country rows into a dict-of-lists:',
        lines: [
          'def group_by_country(rows):',
          '    res = {}',
          '    for country, val in rows:',
          '        res[country].append(val)',
          '    return res',
        ],
        bugLineIdx: 3,
        failingCase: "group_by_country([('SG', 10)]) -> KeyError: 'SG'",
        explanation:
          '`res[country]` does not exist the first time a country appears, so accessing it raises `KeyError`.',
        fix: '        if country not in res:\n            res[country] = []\n        res[country].append(val)',
      },
      {
        kind: 'mcq',
        id: 'dict-q4',
        prompt: 'In Lecture 8\'s BST Multiset representation, when does `adjoin_mset` degrade from `O(log n)` to `O(n)`?',
        options: [
          'When elements are stored with counts `[x, count]`',
          'When the tree becomes unbalanced (e.g., inserting elements in already-sorted order)',
          'When `intersection_of` uses in-order traversal',
          'Never — BSTs are always O(log n)',
        ],
        correctIdx: 1,
        explanation:
          'A plain BST (without self-balancing) inserted in sorted order becomes a straight chain of height `n`, degrading search and insertion from `O(log n)` to `O(n)`.',
      },
    ],
  },

  /* =====================================================================
   * TOPIC 7: OBJECT-ORIENTED PROGRAMMING & INHERITANCE
   * Lecture 9
   * ===================================================================== */
  {
    id: 'oop',
    number: 7,
    title: 'Object-Oriented Programming & Inheritance',
    week: 'Lecture 9',
    tagline:
      'Classes & instances, self dispatch, super(), isinstance vs type, overriding, multiple inheritance & Diamond MRO.',
    examFocus: 'PE (Q3) • Final',
    examples: [
      {
        title: 'Encapsulation & Classes vs. Instances (`BankAccount`)',
        summary:
          'OOP bundles state (attributes) and behaviour (methods) together inside objects. A class is the blueprint; each call `BankAccount(100)` creates a distinct instance with its own `self`.',
        code: `# 4 Core OOP Ideas (Lecture 9):
#   Encapsulation | Data Abstraction | Inheritance | Polymorphism

class BankAccount:
    def __init__(self, balance): # Constructor (special dunder method)
        self.balance = balance   # Instance attribute

    def deposit(self, amount):
        self.balance += amount
        return self.balance

    def withdraw(self, amount):
        if amount > self.balance:
            return "Insufficient funds"
        self.balance -= amount
        return self.balance

acc = BankAccount(100)           # Python passes acc automatically as self
print(acc.deposit(50), acc.withdraw(30))`,
        output: '150 120',
        keyPoints: [
          'You have already been using OOP: `lst.append(4)` calls the `append` method on a `list` object!',
          'Every class implicitly inherits from the root `object` class in Python 3.',
          'Remember Topic 1\'s trap: never put mutable defaults like `items=[]` in `__init__` — use `items=None`.',
        ],
      },
      {
        title: 'Inheritance, `super()`, and `isinstance` vs `type`',
        summary:
          'Inheritance models an "is-a" relationship (e.g., Star Trek `NamedObject → MobileObject → Ship → EnemyShip`). Use `super()` to reuse parent methods and `isinstance` for type checks.',
        code: `class NamedObject:
    def __init__(self, name):
        self.name = name

class MobileObject(NamedObject):
    def __init__(self, name, pos):
        super().__init__(name)   # NEVER pass self into super()!
        self.pos = pos

class Ship(MobileObject):
    def move(self, dx):
        self.pos += dx

s = Ship("Enterprise", 0)
s.move(5)
print(s.name, s.pos)
print(isinstance(s, NamedObject), type(s) == NamedObject)`,
        output: `Enterprise 5
True False`,
        keyPoints: [
          '`isinstance(obj, Class)` checks the ENTIRE inheritance chain (`Ship → MobileObject → NamedObject → object`), returning `True`.',
          '`type(obj) == Class` checks ONLY the exact concrete class, so `type(s) == NamedObject` is `False`!',
          'Never pass `self` to `super().__init__(name)` — `super()` binds `self` automatically.',
        ],
      },
      {
        title: 'Polymorphism & `self` Dispatch (`Speaker` → `ArrogantLecturer`)',
        summary:
          '`self` ALWAYS refers to the concrete instance at the bottom of the hierarchy. When a superclass method calls `self.say(...)`, Python invokes the subclass\'s overridden `say`!',
        code: `# Lecture 9 classic hierarchy:
class Speaker:
    def say(self, stuff):
        return stuff

class Lecturer(Speaker):
    def lecture(self, stuff):
        return self.say(stuff + " -- you should take notes")

class ArrogantLecturer(Lecturer):
    def say(self, stuff):        # Overrides Speaker.say!
        return super().say(stuff) + " ... How cool is that?"

prof = ArrogantLecturer()
print(prof.lecture("Python"))`,
        output: 'Python -- you should take notes ... How cool is that?',
        keyPoints: [
          '`prof.lecture("Python")` runs `Lecturer.lecture`, which calls `self.say(...)`.',
          'Because `self` is an `ArrogantLecturer`, `self.say(...)` dispatches to `ArrogantLecturer.say`, NOT `Speaker.say`!',
          'This is Polymorphism: the same method call behaves differently depending on the object\'s actual class.',
        ],
      },
      {
        title: 'Multiple Inheritance & Diamond MRO (`SingingArrogantLecturer`)',
        summary:
          'When a class inherits from multiple parents, superclass order matters. In a Diamond hierarchy, Python\'s MRO guarantees all subclasses\' methods are called BEFORE the shared superclass!',
        code: `class Speaker:
    def say(self, stuff):
        return stuff

class Lecturer(Speaker):
    pass

class ArrogantLecturer(Lecturer):
    def say(self, stuff):
        return super().say(stuff) + " ... How cool is that?"

class Singer(Speaker):           # Diamond! Both parents inherit from Speaker
    def say(self, stuff):
        return "tra-la-la -- " + super().say(stuff)

class SingingArrogantLecturer(ArrogantLecturer, Singer):
    pass

# MRO: SingingArrogantLecturer -> ArrogantLecturer -> Lecturer -> Singer -> Speaker
sal = SingingArrogantLecturer()
print(sal.say("Python is cool"))`,
        output: 'tra-la-la -- Python is cool ... How cool is that?',
        keyPoints: [
          'MRO rule (Lecture 9): "All subclasses\' methods must be called before the superclass\'s."',
          'Inside `ArrogantLecturer.say`, `super()` follows the instance\'s MRO (`sal`) → so `super().say(...)` calls `Singer.say`, which then calls `Speaker.say`!',
          'Parent order matters in MRO: if `Singer` did NOT inherit from `Speaker`, `(ArrogantLecturer, Singer)` would hit `Speaker.say` first and skip `Singer.say` completely!',
        ],
        visual: 'oop',
      },
    ],
    traps: [
      {
        title: 'Passing `self` Into `super().__init__`',
        code: `class MobileObject(NamedObject):
    def __init__(self, name, pos):
        super().__init__(self, name)   # BUG!
        self.pos = pos`,
        commonGuess: 'Initializes NamedObject with name',
        actualResult: 'TypeError: NamedObject.__init__() takes 2 positional arguments but 3 were given',
        why: '`super()` already binds `self` automatically, so passing `self` again sends `self` twice.',
        rule: 'Write `super().__init__(name)` — NEVER pass `self` into `super()` calls.',
      },
      {
        title: '`type(obj) == Parent` Fails for Subclasses',
        code: `class Vehicle: pass
class Truck(Vehicle): pass

t = Truck()
print(type(t) == Vehicle, isinstance(t, Vehicle))`,
        commonGuess: 'True True',
        actualResult: 'False True',
        why: '`type(t)` is `Truck`, which is not equal to `Vehicle`. Only `isinstance` walks the inheritance chain.',
        rule: 'Always use `isinstance(obj, Parent)` to test "is-a" membership in OOP.',
      },
      {
        title: 'Diamond MRO: `super()` Calls Sibling Before Shared Parent!',
        code: `# ArrogantLecturer(Lecturer -> Speaker) and Singer(Speaker):
# class SAL(ArrogantLecturer, Singer): pass
# Inside ArrogantLecturer.say: super().say(stuff) + " ... How cool?"`,
        commonGuess: 'ArrogantLecturer\'s super() jumps straight to Speaker.say()',
        actualResult: 'super() calls Singer.say() FIRST, then Speaker.say()!',
        why: '`super()` does NOT mean "my direct parent class" — it means "the NEXT class in `self`\'s MRO". Because `Speaker` is shared by both branches, `Singer` must come before `Speaker` in the MRO.',
        rule: 'Write out the full MRO of the concrete instance (`Cls.__mro__`) whenever multiple inheritance forms a diamond.',
      },
    ],
    practice: [
      {
        kind: 'mcq',
        id: 'oop-q1',
        prompt: 'Using Lecture 9\'s Diamond hierarchy (`Singer(Speaker)`, `ArrogantLecturer(Lecturer)` where `Lecturer(Speaker)`), what does `SingingArrogantLecturer().say("Hi")` return?',
        code: `class Speaker:
    def say(self, s): return s

class Lecturer(Speaker): pass

class ArrogantLecturer(Lecturer):
    def say(self, s): return super().say(s) + "!"

class Singer(Speaker):
    def say(self, s): return "la-" + super().say(s)

class SingingArrogantLecturer(ArrogantLecturer, Singer): pass`,
        options: [
          '"Hi!"',
          '"la-Hi!"',
          '"la-Hi" (without !)',
          '"Hi!la-"',
        ],
        correctIdx: 1,
        explanation:
          'MRO is `SingingArrogantLecturer → ArrogantLecturer → Lecturer → Singer → Speaker`. `ArrogantLecturer.say("Hi")` calls `super().say("Hi")` → `Singer.say("Hi")` → `"la-" + Speaker.say("Hi")` = `"la-Hi"`, then appends `"!"` → `"la-Hi!"`.',
      },
      {
        kind: 'mcq',
        id: 'oop-q2',
        prompt: 'If `class Ship(MobileObject)` and `class MobileObject(NamedObject)`, what does `print(isinstance(Ship(), NamedObject), type(Ship()) == NamedObject)` output?',
        options: ['True True', 'True False', 'False True', 'False False'],
        correctIdx: 1,
        explanation:
          '`isinstance` checks the full inheritance chain (`True`), whereas `type(Ship())` is `Ship`, not `NamedObject` (`False`).',
      },
      {
        kind: 'bug-line',
        id: 'oop-q3',
        prompt: 'Click the line that causes a `TypeError` when creating `EnemyShip("Klingon", 10, 50)`:',
        lines: [
          'class Ship:',
          '    def __init__(self, name, pos):',
          '        self.name = name',
          '        self.pos = pos',
          'class EnemyShip(Ship):',
          '    def __init__(self, name, pos, power):',
          '        super().__init__(self, name, pos)',
          '        self.power = power',
        ],
        bugLineIdx: 6,
        failingCase: 'EnemyShip("Klingon", 10, 50) -> TypeError: takes 3 positional arguments but 4 were given',
        explanation:
          '`super()` already binds `self` automatically; passing `self` explicitly sends it a second time.',
        fix: '        super().__init__(name, pos)',
      },
      {
        kind: 'mcq',
        id: 'oop-q4',
        prompt: 'In Lecture 9, `Lecturer.lecture(self, stuff)` calls `self.say(stuff + "!")`. When called on an `ArrogantLecturer` instance (which overrides `say`), which `say` executes?',
        options: [
          'Speaker.say (because Lecturer inherits directly from Speaker)',
          'ArrogantLecturer.say (because self is an ArrogantLecturer instance)',
          'AttributeError',
          'Both Speaker.say and Lecturer.say, skipping ArrogantLecturer.say',
        ],
        correctIdx: 1,
        explanation:
          '`self` always refers to the full concrete object (`ArrogantLecturer`), so `self.say(...)` starts lookup in `ArrogantLecturer` first!',
      },
    ],
  },

  /* =====================================================================
   * TOPIC 8: EXCEPTION HANDLING (+ NON-EXAMINABLE MEMO/DP NOTE)
   * Lectures 10 & 12
   * ===================================================================== */
  {
    id: 'exceptions',
    number: 8,
    title: 'Exception Handling (& L12 Syllabus Scope)',
    week: 'Lectures 10 & 12',
    tagline:
      'Syntax errors vs exceptions, try/except/else/finally execution order, raise, custom MyError, and L12 non-examinable memo/DP note.',
    examFocus: 'PE • Final',
    examples: [
      {
        title: 'Syntax Errors vs. Runtime Exceptions',
        summary:
          'Lecture 10 distinguishes two kinds of errors: Syntax Errors (detected before code runs) and Exceptions (detected during execution, which can be caught and handled).',
        code: `# Syntax Error: caught during parsing (cannot be caught with try/except!)
#   while True print('Hello')     -> SyntaxError: invalid syntax

# Common Runtime Exceptions in CS1010A:
#   ZeroDivisionError : 10 * (1 / 0)
#   NameError         : 4 + spam * 3       (undefined variable)
#   TypeError         : '2' + 2            (incompatible operand types)
#   ValueError        : int('abc')         (right type, invalid value)
#   IndexError        : [1, 2][5]          (index out of range)
#   KeyError          : {'a': 1}['b']      (missing dict key)

def safe_int(s):
    try:
        return int(s)
    except ValueError:
        return None

print(safe_int("42"), safe_int("CS1010A"))`,
        output: '42 None',
        keyPoints: [
          'If an exception is not caught in the current function, it propagates up the call stack to callers until caught or crashing the program.',
          'Catch specific exception types (e.g., `except ValueError:`) rather than silently swallowing every bug.',
        ],
      },
      {
        title: '`try` / `except` / `else` / `finally` Control Flow',
        summary:
          'Lecture 10\'s `divide_test(x, y)` illustrates every clause: `else` runs ONLY if `try` raised NO exception, while `finally` ALWAYS executes — even right before an uncaught exception propagates!',
        code: `# Exact Lecture 10 example:
def divide_test(x, y):
    try:
        result = x / y
    except ZeroDivisionError:
        print("division by zero!")
    else:
        print("result is", result)
    finally:
        print("executing finally clause")

divide_test(2, 1)      # prints: result is 2.0  |  executing finally clause
divide_test(2, 0)      # prints: division by zero!  |  executing finally clause
# divide_test("2", "1") -> prints "executing finally clause", THEN raises TypeError!`,
        output: `result is 2.0
executing finally clause
division by zero!
executing finally clause`,
        keyPoints: [
          'Order of clauses is fixed: `try` → one or more `except` (wildcard `except:` MUST be last) → optional `else` → optional `finally`.',
          '`else` is SKIPPED whenever an exception occurs (even if it was caught by `except`).',
          '`finally` ALWAYS runs (great for closing files), even if `try` hits a `return` or an UNCAUGHT exception!',
        ],
        visual: 'exceptions',
      },
      {
        title: '`raise` & User-Defined Exceptions (`MyError`)',
        summary:
          'You can trigger exceptions manually with `raise`, and define your own exception classes by inheriting from `Exception`.',
        code: `# Raising a built-in exception manually:
# raise NameError('HiThere')

# Lecture 10 User-Defined Exception:
class MyError(Exception):
    def __init__(self, value):
        self.value = value
    def __str__(self):
        return repr(self.value)

try:
    raise MyError(2 * 2)
except MyError as e:
    print("My exception occurred, value:", e.value)`,
        output: 'My exception occurred, value: 4',
        keyPoints: [
          'Custom exceptions must inherit from `Exception` (directly or indirectly).',
          'Use `except MyError as e:` to bind the raised exception instance to `e` and read attributes like `e.value` or `str(e)`.',
        ],
      },
      {
        title: 'Syllabus Note (Lecture 12): Memoization & DP Are NOT on PE/Finals',
        summary:
          'Lecture 10 teaches Memoization (caching recursive calls) and bottom-up Dynamic Programming (filling a table), AND Lecture 12 Slide 32 explicitly states: "Memoization & Dynamic Programming — Won\'t come out on PE/Finals."',
        code: `# Reference only (NOT tested on PE or Final Exam per Lecture 12 Slide 32):
# 1. Memoization (top-down cache via closure):
def memoize(f):
    table = {}
    def helper(*args):
        if args not in table:
            table[args] = f(*args)
        return table[args]
    return helper

# 2. Bottom-up DP (e.g., Pascal's triangle dp_choose(n, k) in O(nk)):
#    Fill table row-by-row from base cases up to target (n, k).
#    Tip from L10: use table.append(row.copy()) to avoid row aliasing!`,
        keyPoints: [
          'Lecture 12 Slide 32 explicitly confirms: Memoization & Dynamic Programming will NOT be tested on PE or Finals.',
          'Still worth recognizing `memoize(f)`\'s closure + `*args` pattern and `row.copy()` (which reinforce Lectures 4, 7, and 10!).',
          'Exam time allocation (L12): focus PE prep on Recursion/Iteration (Q1), File/Dict Data Processing (Q2), and OOP (Q3).',
        ],
      },
    ],
    traps: [
      {
        title: '`finally` Executes BEFORE an Uncaught Exception Crashes',
        code: `def divide_test(x, y):
    try:
        result = x / y
    except ZeroDivisionError:
        print("div zero")
    else:
        print("ok", result)
    finally:
        print("finally!")

divide_test("2", "1")`,
        commonGuess: 'Crashes immediately with TypeError (nothing printed)',
        actualResult: 'Prints "finally!", THEN raises TypeError!',
        why: '`TypeError` is not caught by `except ZeroDivisionError:`, so Python runs `finally` first before propagating the uncaught `TypeError`.',
        rule: '`finally` ALWAYS executes — on normal completion, caught exceptions, uncaught exceptions, and even `return` inside `try`!',
      },
      {
        title: 'Wildcard `except:` Placed Before Specific `except`',
        code: `try:
    x = int("abc")
except:
    print("generic")
except ValueError:
    print("bad int")`,
        commonGuess: 'Prints "generic"',
        actualResult: "SyntaxError: default 'except:' must be last",
        why: 'Python forbids a bare `except:` before more specific exception handlers because the later handlers would be unreachable.',
        rule: 'Always list specific `except` clauses first and put any bare `except:` last.',
      },
      {
        title: 'Thinking `else` Runs After `except` Catches an Error',
        code: `try:
    1 / 0
except ZeroDivisionError:
    print("A")
else:
    print("B")
finally:
    print("C")`,
        commonGuess: 'Prints A, B, C',
        actualResult: 'Prints A, C  (B is SKIPPED!)',
        why: 'The `else` block runs ONLY when the `try` block finishes with zero exceptions.',
        rule: 'Think of `else` as "if `try` succeeded cleanly"; think of `finally` as "always run no matter what".',
      },
    ],
    practice: [
      {
        kind: 'mcq',
        id: 'exc-q1',
        prompt: 'What happens when Lecture 10\'s `divide_test("2", "1")` is called?',
        code: `def divide_test(x, y):
    try:
        result = x / y
    except ZeroDivisionError:
        print("division by zero!")
    else:
        print("result is", result)
    finally:
        print("executing finally clause")

divide_test("2", "1")`,
        options: [
          'Raises TypeError immediately without printing anything',
          'Prints "executing finally clause", then raises TypeError',
          'Prints "division by zero!" then "executing finally clause"',
          'Prints "result is 2.0" then "executing finally clause"',
        ],
        correctIdx: 1,
        explanation:
          '`"2" / "1"` raises `TypeError`, which does not match `ZeroDivisionError`. Python executes the `finally` clause first, then propagates the uncaught `TypeError`.',
      },
      {
        kind: 'mcq',
        id: 'exc-q2',
        prompt: 'What is printed by this snippet?',
        code: `try:
    x = 10 / 0
except ZeroDivisionError:
    print("E", end=" ")
else:
    print("S", end=" ")
finally:
    print("F", end=" ")`,
        options: ['E S F', 'E F', 'S F', 'F'],
        correctIdx: 1,
        explanation:
          '`10 / 0` raises `ZeroDivisionError` → caught by `except` (prints `E`). `else` is skipped because an exception occurred. `finally` always runs (prints `F`).',
      },
      {
        kind: 'bug-line',
        id: 'exc-q3',
        prompt: 'Click the line that causes a `SyntaxError` in this exception handler:',
        lines: [
          'def parse_ratio(a, b):',
          '    try:',
          '        return int(a) / int(b)',
          '    except:',
          '        return None',
          '    except ZeroDivisionError:',
          '        return 0',
        ],
        bugLineIdx: 3,
        failingCase: "SyntaxError: default 'except:' must be last",
        explanation:
          'A bare wildcard `except:` catches all exceptions and MUST appear after all specific `except <ErrorType>:` blocks.',
        fix: 'Put `except ZeroDivisionError:` BEFORE the bare `except:` block.',
      },
    ],
  },
];
