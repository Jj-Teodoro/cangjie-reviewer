/* ---------- Course content (based on the Cangjie 1.0 developer guide) ---------- */
const LESSONS = [
{
  id: 'start', title: 'Getting started', blurb: 'Install the SDK, set up the environment, and run Hello World with cjc and cjpm.',
  body: [
    ['p', 'Cangjie is a general-purpose, statically typed language from Huawei. The SDK ships two tools you will use from day one: <code>cjc</code>, the compiler, and <code>cjpm</code>, the package manager and build tool.'],
    ['h', 'Install the SDK'],
    ['p', 'Download the package for your platform from the Cangjie site: <code>cangjie-sdk-linux-x64-x.y.z.tar.gz</code>, <code>cangjie-sdk-linux-aarch64-…</code>, <code>cangjie-sdk-mac-aarch64-…</code>, or <code>cangjie-sdk-windows-x64-….exe/.zip</code>.'],
    ['table', [['Platform', 'Requirements'], ['Linux (x86_64, aarch64)', 'glibc 2.27+, kernel 4.15+, libstdc++ 6.0.24+. Install OpenSSL 3 yourself.'], ['macOS', '12.0 or later, Apple silicon. Run <code>brew install libffi</code> first.'], ['Windows', 'Windows 10 is the reference. The toolchain is MinGW-based and may lack a few Linux features.']]],
    ['h', 'Linux and macOS'],
    ['shell', `tar xvf cangjie-sdk-linux-x64-x.y.z.tar.gz
source cangjie/envsetup.sh
cjc -v`],
    ['p', '<code>envsetup.sh</code> only affects the current shell. To keep it, add <code>source /home/user/cangjie/envsetup.sh</code> to <code>~/.bashrc</code> or <code>~/.zshrc</code>.'],
    ['h', 'Windows'],
    ['p', 'The .exe runs an install wizard. The .zip contains one setup script per shell:'],
    ['shell', `path\\to\\cangjie\\envsetup.bat        # CMD
. path\\to\\cangjie\\envsetup.ps1      # PowerShell
source path/to/cangjie/envsetup.sh   # MSYS / bash`],
    ['note', '<strong>Make it permanent on Windows:</strong> set <code>CANGJIE_HOME</code> (for example <code>D:\\cangjie</code>) and add <code>%CANGJIE_HOME%\\bin</code>, <code>%CANGJIE_HOME%\\tools\\bin</code>, <code>%CANGJIE_HOME%\\tools\\lib</code> and <code>%CANGJIE_HOME%\\runtime\\lib\\windows_x86_64_cjnative</code> to <code>Path</code>.'],
    ['h', 'Hello World with cjc'],
    ['code', `// hello.cj
main() {
    println("Hello, Cangjie")
}`, 'Hello, Cangjie', 'hello.cj'],
    ['shell', `cjc hello.cj -o hello        # Windows: cjc hello.cj -o hello.exe
./hello`],
    ['p', 'Comments use <code>//</code> for one line and <code>/* … */</code> for several lines.'],
    ['h', 'Hello World with cjpm'],
    ['p', '<code>cjpm init</code> creates a project with a <code>cjpm.toml</code> manifest and <code>src/main.cj</code>. <code>cjpm run</code> builds and runs it.'],
    ['shell', `cjpm init --path hello_cjpm
cd hello_cjpm
cjpm run`],
    ['code', `// src/main.cj
package hello_cjpm

main(): Int64 {
    println("hello world")
    return 0
}`, 'hello world\ncjpm run finished', 'src/main.cj'],
  ],
  quiz: [
    { q: 'Which command compiles <code>hello.cj</code> into an executable called <code>hello</code>?', o: ['<code>cjc hello.cj -o hello</code>', '<code>cjpm hello.cj</code>', '<code>cjc run hello.cj</code>', '<code>cangjie build hello.cj</code>'], a: 0, why: '<code>cjc</code> is the compiler and <code>-o</code> names the output file.' },
    { q: 'You ran <code>source cangjie/envsetup.sh</code>, then opened a new terminal. <code>cjc</code> is not found. Why?', o: ['envsetup only affects the shell it ran in', 'cjc must be reinstalled per terminal', 'envsetup needs root', 'cjc only works inside a cjpm project'], a: 0, why: 'Add the <code>source</code> line to <code>~/.bashrc</code> or <code>~/.zshrc</code> to keep it.' },
    { q: 'What does <code>cjpm init</code> generate?', o: ['<code>cjpm.toml</code> and <code>src/main.cj</code>', 'Only a <code>Makefile</code>', 'A compiled <code>main</code> binary', '<code>package.json</code>'], a: 0, why: 'cjpm creates the manifest plus a starter source file.' },
    { q: 'How do you load the Cangjie environment in Windows PowerShell?', o: ['<code>. path\\to\\cangjie\\envsetup.ps1</code>', '<code>source envsetup.sh</code>', '<code>cjc --setup</code>', '<code>set CANGJIE=1</code>'], a: 0, why: 'PowerShell dot-sources <code>envsetup.ps1</code>; CMD uses <code>envsetup.bat</code>.' },
  ]
},
{
  id: 'types', title: 'Basic data types', blurb: 'Integers, floats, Bool, Rune, String with interpolation, and tuples.',
  body: [
    ['h', 'Integers'],
    ['p', 'Signed: <code>Int8</code>, <code>Int16</code>, <code>Int32</code>, <code>Int64</code>, <code>IntNative</code>. Unsigned: <code>UInt8</code> … <code>UInt64</code>, <code>UIntNative</code>. An integer literal with no other type context is <code>Int64</code>.'],
    ['p', 'Prefixes pick the base (<code>0b</code>, <code>0o</code>, <code>0x</code>), underscores group digits, and suffixes pick the type: <code>i8 i16 i32 i64 u8 u16 u32 u64</code>.'],
    ['code', `main() {
    let a = 100           // Int64 by default
    let b = 100i8         // Int8
    let c = 0x10u64       // UInt64, value 16
    let d = 0b0001_1000   // binary, value 24
    let e = b'x'          // UInt8 byte literal, value 120
    println("\${a} \${b} \${c} \${d} \${e}")
}`, '100 100 16 24 120'],
    ['p', 'Literals that do not fit are compile errors: <code>let x: Int8 = 128</code> and <code>let y: UInt8 = 256</code> both fail.'],
    ['h', 'Floats, Bool and Rune'],
    ['p', '<code>Float16</code>, <code>Float32</code>, <code>Float64</code> follow IEEE 754, with suffixes <code>f16 f32 f64</code>: <code>3.14</code>, <code>2e3</code>, <code>.123e2f64</code>. <code>Bool</code> is <code>true</code> or <code>false</code>. A <code>Rune</code> is one Unicode character written <code>r\'甲\'</code>.'],
    ['h', 'Strings'],
    ['p', 'A <code>String</code> uses double or single quotes. Triple quotes make a multi-line string, and <code>#"…"#</code> makes a raw one. Embed any expression with <code>${…}</code>.'],
    ['code', `main() {
    let fruit = "apples"
    let count = 10
    println("There are \${count * count} \${fruit}")
    println("hello" + " " + "world")
    println("Cangjie".contains("jie"))
}`, 'There are 100 apples\nhello world\ntrue'],
    ['h', 'Tuples'],
    ['p', 'A tuple groups fixed values of possibly different types. Read elements by index. Elements cannot be changed, but a <code>var</code> tuple can be replaced as a whole.'],
    ['code', `main() {
    let point: (Int64, Float64) = (3, 3.141592)
    println(point[0])
}`, '3'],
    ['p', 'Tuples can name their elements in a return type: <code>func price(): (name: String, price: Int64)</code>.'],
  ],
  quiz: [
    { q: 'What type does <code>let n = 42</code> give <code>n</code>?', o: ['<code>Int64</code>', '<code>Int32</code>', '<code>IntNative</code>', '<code>UInt64</code>'], a: 0, why: 'Integer literals default to Int64 when nothing else fixes their type.' },
    { q: 'What happens with <code>let x: Int8 = 128</code>?', o: ['Compile error', 'x becomes -128', 'x becomes 127', 'Runtime exception'], a: 0, why: 'Int8 holds -128 to 127, and out-of-range literals are rejected at compile time.' },
    { q: 'What is the value of <code>0x10u64</code>?', o: ['16 as UInt64', '10 as UInt64', '16 as Int64', '64'], a: 0, why: '<code>0x</code> is hex, so 0x10 is 16, and <code>u64</code> makes it UInt64.' },
    { q: 'Which line prints <code>Sum: 5</code>?', o: ['<code>println("Sum: ${2 + 3}")</code>', '<code>println("Sum: {2 + 3}")</code>', '<code>println("Sum: #(2 + 3)")</code>', '<code>println(f"Sum: {2 + 3}")</code>'], a: 0, why: 'Cangjie interpolation is <code>${expression}</code>.' },
    { q: 'Given <code>let t = (1, "two")</code>, how do you read <code>"two"</code>?', o: ['<code>t[1]</code>', '<code>t.1</code>', '<code>t.second</code>', '<code>t(1)</code>'], a: 0, why: 'Tuple elements are indexed from 0 with square brackets.' },
  ]
},
{
  id: 'vars', title: 'Variables and values', blurb: 'let, var and const; type inference; value types versus reference types.',
  body: [
    ['p', 'Every variable declaration needs a mutability modifier: <code>let</code> (assign once) or <code>var</code> (reassignable). The general form is <code>modifier name: Type = value</code>. The type can be left out when it can be inferred.'],
    ['code', `main() {
    let name = "Cangjie"   // immutable, inferred String
    var count = 0          // mutable
    count += 1
    // name = "Other"      // error: a let cannot be reassigned

    let total: Int64       // declared now, assigned once later
    total = count * 10
    println("\${name} \${count} \${total}")
}`, 'Cangjie 1 10'],
    ['p', 'A local variable may skip its initializer if it has a type annotation, but it must be assigned before use. Globals and static members must be initialized where they are defined.'],
    ['h', 'Compile-time constants'],
    ['p', '<code>const</code> declares a value computed at compile time. It always needs an initializer and cannot be defined in an extension.'],
    ['code', `const G = 6.674e-11

main() {
    println(G > 0.0)
}`, 'true'],
    ['h', 'Value types and reference types'],
    ['p', 'Structs and the basic types are value types: assignment copies them. Classes and <code>Array</code> are reference types: assignment shares the same object.'],
    ['code', `struct Copy {
    var data = 2012
}

class Share {
    var data = 2012
}

main() {
    let c1 = Copy()
    var c2 = c1
    c2.data = 2023
    println("\${c1.data}, \${c2.data}")

    let s1 = Share()
    let s2 = s1
    s2.data = 2023
    println("\${s1.data}, \${s2.data}")
}`, '2012, 2023\n2023, 2023'],
    ['p', 'An inner scope may shadow an outer name by declaring a new variable with the same name.'],
  ],
  quiz: [
    { q: 'Which declaration can be reassigned later?', o: ['<code>var x = 1</code>', '<code>let x = 1</code>', '<code>const x = 1</code>', '<code>x = 1</code> without a modifier'], a: 0, why: 'Only <code>var</code> allows reassignment. A bare <code>x = 1</code> is not a declaration.' },
    { q: 'Which of these is <b>invalid</b>?', o: ['<code>const LIMIT: Int64</code>', '<code>let a: Int64</code> then <code>a = 5</code> (local)', '<code>var b = 2</code>', '<code>let c = "hi"</code>'], a: 0, why: 'A const must have an initializer.' },
    { q: 'What does <code>c1.data</code> hold at the end?', code: 'struct Copy {\n    var data = 2012\n}\n\nmain() {\n    let c1 = Copy()\n    var c2 = c1\n    c2.data = 2023\n}', o: ['2012', '2023', '0', 'A compile error'], a: 0, why: 'Structs are value types, so <code>c2</code> is a separate copy.' },
    { q: 'What does <code>s1.data</code> hold at the end?', code: 'class Share {\n    var data = 2012\n}\n\nmain() {\n    let s1 = Share()\n    let s2 = s1\n    s2.data = 2023\n}', o: ['2023', '2012', '0', 'A compile error'], a: 0, why: 'Classes are reference types, so <code>s1</code> and <code>s2</code> point to the same object.' },
  ]
},
{
  id: 'flow', title: 'Control flow', blurb: 'if as an expression, while, do-while, for-in over ranges, where filters.',
  body: [
    ['h', 'if is an expression'],
    ['p', 'The condition must be a <code>Bool</code>. Writing <code>if (number)</code> with an integer is a compile error. Because <code>if</code> produces a value, it replaces the ternary operator.'],
    ['code', `main() {
    let voltage = 3.3
    let bit = if (voltage < 2.5) { "0" } else { "1" }
    println(bit)
}`, '1'],
    ['h', 'Ranges'],
    ['p', '<code>start..end</code> excludes the end, <code>start..=end</code> includes it, and <code>: step</code> sets the step (default 1, never 0). Counting down needs a negative step.'],
    ['table', [['Range', 'Values'], ['<code>0..5</code>', '0 1 2 3 4'], ['<code>0..=5</code>', '0 1 2 3 4 5'], ['<code>0..=10 : 5</code>', '0 5 10'], ['<code>10..=0 : -2</code>', '10 8 6 4 2 0']]],
    ['h', 'for-in and where'],
    ['code', `main() {
    var sum = 0
    for (i in 1..=100) {
        sum += i
    }
    println(sum)

    for (i in 0..8 where i % 2 == 1) {
        println(i)
    }
}`, '5050\n1\n3\n5\n7'],
    ['p', 'The loop variable is immutable. Use <code>_</code> when you do not need it, and destructure tuples with <code>for ((x, y) in pairs)</code>.'],
    ['h', 'while and do-while'],
    ['code', `main() {
    var n = 1
    while (n < 100) {
        n *= 2
    }
    println(n)

    var k = 0
    do {
        k++
    } while (k < 3)
    println(k)
}`, '128\n3'],
    ['p', '<code>break</code> leaves the loop and <code>continue</code> skips to the next iteration. Both have type <code>Nothing</code>, as does <code>return</code>.'],
  ],
  quiz: [
    { q: 'What happens with <code>let n = 3</code> and <code>if (n) { … }</code>?', o: ['Compile error', 'Runs the block because 3 is non-zero', 'Skips the block', 'Runtime exception'], a: 0, why: 'Conditions must be Bool. There is no implicit integer-to-Bool conversion.' },
    { q: 'How many times does <code>for (i in 0..10)</code> run?', o: ['10', '11', '9', 'It does not compile'], a: 0, why: '<code>..</code> excludes the end, so i goes 0 to 9.' },
    { q: 'What does <code>for (i in 10..=0 : -2)</code> visit?', o: ['10 8 6 4 2 0', '10 8 6 4 2', 'Nothing', '0 2 4 6 8 10'], a: 0, why: '<code>..=</code> includes the end and the step is -2.' },
    { q: 'What does <code>where</code> do in <code>for (i in 0..8 where i % 2 == 1)</code>?', o: ['Skips iterations where the condition is false', 'Stops the loop at the first false', 'Declares a new variable', 'Sets the step'], a: 0, why: 'It filters the iterations, printing 1 3 5 7.' },
    { q: 'Which is the closest Cangjie version of <code>c ? a : b</code>?', o: ['<code>if (c) { a } else { b }</code>', '<code>c ? a : b</code>', '<code>c ?? a : b</code>', '<code>when (c) a else b</code>'], a: 0, why: '<code>if</code> is an expression and has no separate ternary form.' },
  ]
},
{
  id: 'func', title: 'Functions and lambdas', blurb: 'func, named and default parameters, lambdas, trailing lambdas, operator overloading.',
  body: [
    ['h', 'Defining functions'],
    ['p', 'Parameters are immutable inside the body. The return type is optional and the last expression of the body is its value.'],
    ['h', 'Named parameters'],
    ['p', 'Add <code>!</code> after a parameter name to make it named. Callers then pass <code>name: value</code>. Only named parameters can have defaults, and they must come after positional ones.'],
    ['code', `func add(a: Int64, b: Int64): Int64 {
    return a + b
}

func greet(name: String, greeting!: String = "Hello"): String {
    "\${greeting}, \${name}!"
}

main() {
    println(add(2, 3))
    println(greet("Cangjie"))
    println(greet("Cangjie", greeting: "Ni hao"))
}`, '5\nHello, Cangjie!\nNi hao, Cangjie!'],
    ['h', 'Lambdas'],
    ['p', 'The form is <code>{ params => body }</code>. Parameter types can be dropped when the target type is known, and a lambda can be called right where it is written.'],
    ['code', `main() {
    let sum = { a: Int64, b: Int64 => a + b }
    println(sum(1, 2))

    let twice: (Int64) -> Int64 = { x => x * 2 }
    println(twice(21))

    println({ a: Int64, b: Int64 => a * b }(6, 7))
}`, '3\n42\n42'],
    ['p', 'When the last argument is a lambda it can go after the parentheses as a trailing lambda, for example <code>f { println("World") }</code>. Only trailing lambdas may leave out <code>=></code>.'],
    ['h', 'Operator overloading'],
    ['p', 'Mark a member function with <code>operator</code>. This works in classes, structs, interfaces, enums and extensions. Operator functions cannot be static or generic.'],
    ['code', `struct Point {
    let x: Int64
    let y: Int64

    public init(x: Int64, y: Int64) {
        this.x = x
        this.y = y
    }

    public operator func +(right: Point): Point {
        Point(this.x + right.x, this.y + right.y)
    }
}

main() {
    let p = Point(1, 2) + Point(10, 20)
    println("(\${p.x}, \${p.y})")
}`, '(11, 22)'],
    ['h', 'Pipelines'],
    ['p', 'The pipeline operator <code>|></code> passes the value on its left as the argument to the function on its right, so nested calls read in order. The operator table also lists <code>~></code> for composing two functions.'],
    ['code', `func double(a: Int64): Int64 {
    a * 2
}

func increment(a: Int64): Int64 {
    a + 1
}

main() {
    println(5 |> double |> double |> increment |> double)
}`, '42'],
    ['h', 'Closures'],
    ['p', 'A nested function or lambda that uses a local variable from its surrounding scope is a closure. A closure over a <code>let</code> is an ordinary value you can return or pass around. A closure over a <code>var</code> can only be called directly: it cannot be assigned, passed or returned.'],
    ['code', `func makeAdder(base: Int64): (Int64) -> Int64 {
    let offset = base * 2
    { x: Int64 => x + offset }
}

main() {
    let add = makeAdder(5)
    println(add(10))
}`, '20'],
  ],
  quiz: [
    { q: 'How do you declare a named parameter <code>scale</code>?', o: ['<code>scale!: Int64</code>', '<code>scale?: Int64</code>', '<code>named scale: Int64</code>', '<code>@scale: Int64</code>'], a: 0, why: 'A <code>!</code> after the name makes it a named parameter.' },
    { q: 'Which signature is <b>invalid</b>?', o: ['<code>func f(a: Int64 = 1)</code>', '<code>func f(a!: Int64 = 1)</code>', '<code>func f(a: Int64, b!: Int64 = 2)</code>', '<code>func f(a!: Int64)</code>'], a: 0, why: 'Default values are only allowed on named parameters.' },
    { q: 'Given <code>func add(a: Int64, b!: Int64 = 2)</code>, which call is correct?', o: ['<code>add(1, b: 5)</code>', '<code>add(1, 5)</code>', '<code>add(a: 1, b: 5)</code>', '<code>add(b = 5, 1)</code>'], a: 0, why: '<code>a</code> is positional and <code>b</code> must be passed by name.' },
    { q: 'Which is a valid lambda that adds one?', o: ['<code>{ x: Int64 => x + 1 }</code>', '<code>(x) -> x + 1</code>', '<code>lambda x: x + 1</code>', '<code>fn(x) { x + 1 }</code>'], a: 0, why: 'Lambdas use braces with <code>=></code> between parameters and body.' },
    { q: 'What does <code>3 |> increment</code> mean?', o: ['<code>increment(3)</code>', '<code>3 + increment</code>', 'Run increment on a new thread', 'Compose 3 with increment'], a: 0, why: 'The pipeline passes the left value as the argument to the right function.' },
    { q: 'A lambda captures a local <code>var</code>. What can you do with it?', o: ['Only call it directly', 'Return it from the function', 'Assign it to another variable', 'Pass it as an argument'], a: 0, why: 'Closures that capture a var cannot be used as first-class values.' },
    { q: 'Which keyword marks an operator overload?', o: ['<code>operator func</code>', '<code>overload func</code>', '<code>func operator+</code>', '<code>impl +</code>'], a: 0, why: 'For example <code>public operator func +(right: Point): Point</code>.' },
  ]
},
{
  id: 'coll', title: 'Arrays and collections', blurb: 'Array, VArray and slices; ArrayList, HashMap and HashSet from std.collection.',
  body: [
    ['h', 'Array'],
    ['p', '<code>Array&lt;T&gt;</code> is a fixed-length reference type. You can change elements but not add or remove them. Slices take a range of indices.'],
    ['code', `main() {
    let a: Array<Int64> = [1, 2, 3, 4, 5]
    println(a.size)
    println(a[0])

    let part = a[1..3]          // indices 1 and 2
    println(part.size)

    let squares = Array<Int64>(4, {i => i * i})
    println(squares[3])

    let zeros = Array<Int64>(3, repeat: 0)
    println(zeros[2])
}`, '5\n1\n2\n9\n0'],
    ['p', 'Slices can leave out either end: <code>a[..3]</code>, <code>a[2..]</code>.'],
    ['h', 'VArray'],
    ['p', '<code>VArray&lt;T, $N&gt;</code> is a value-type array whose length is part of its type: <code>var v: VArray&lt;Int64, $3&gt; = [1, 2, 3]</code>. Its elements cannot be reference types.'],
    ['h', 'ArrayList, HashMap, HashSet'],
    ['p', 'These live in <code>std.collection</code>. HashMap keys and HashSet elements must implement <code>Hashable</code> and <code>Equatable</code>. Iteration order of maps and sets is not guaranteed.'],
    ['code', `import std.collection.*

main() {
    let list = ArrayList<Int64>([0, 1, 2])
    list.add(3)
    list.add(10, at: 1)
    println(list.size)
    println(list[1])

    let prices = HashMap<String, Int64>()
    prices.add("apple", 3)
    prices.add("pear", 5)
    prices["apple"] = 4
    println(prices["apple"])
    println(prices.contains("kiwi"))

    let seen = HashSet<String>()
    seen.add("a")
    seen.add("a")
    println(seen.size)
}`, '5\n10\n4\nfalse\n1'],
    ['table', [['Type', 'Common operations'], ['ArrayList', '<code>add(x)</code>, <code>add(all: c)</code>, <code>add(x, at: i)</code>, <code>remove(at: i)</code>, <code>reserve(n)</code>, <code>size</code>, <code>[i]</code>'], ['HashMap', '<code>add(k, v)</code>, <code>[k]</code>, <code>[k] = v</code>, <code>contains(k)</code>, <code>remove(k)</code>, <code>for ((k, v) in map)</code>'], ['HashSet', '<code>add(x)</code>, <code>contains(x)</code>, <code>remove(x)</code>, <code>size</code>']]],
    ['note', '<strong>Watch out:</strong> reading a missing key with <code>map[k]</code> or an out-of-range index on a list throws at runtime. Check with <code>contains</code> first.'],
  ],
  quiz: [
    { q: 'You need to append items to <code>Array&lt;Int64&gt;</code>. What should you do?', o: ['Use <code>ArrayList&lt;Int64&gt;</code> instead', 'Call <code>arr.add(x)</code>', 'Call <code>arr.push(x)</code>', 'Assign <code>arr[arr.size] = x</code>'], a: 0, why: 'Array is fixed-length. ArrayList grows.' },
    { q: 'Which import gives you <code>HashMap</code>?', o: ['<code>import std.collection.*</code>', '<code>import std.map.*</code>', '<code>import core.HashMap</code>', 'None, it is always available'], a: 0, why: 'Collections live in <code>std.collection</code>.' },
    { q: 'What does <code>map["missing"]</code> do when the key is absent?', o: ['Throws at runtime', 'Returns None', 'Returns 0', 'Fails to compile'], a: 0, why: 'Use <code>contains</code> first, or a method that returns an Option.' },
    { q: 'Which declares a value-type array of three Int64?', o: ['<code>VArray&lt;Int64, $3&gt;</code>', '<code>Array&lt;Int64, 3&gt;</code>', '<code>VArray&lt;Int64&gt;(3)</code>', '<code>Int64[3]</code>'], a: 0, why: 'The length is a type-level value written <code>$3</code>.' },
    { q: 'After <code>s.add("a")</code> twice on an empty HashSet, <code>s.size</code> is…', o: ['1', '2', '0', 'It throws'], a: 0, why: 'Adding an element that is already present has no effect.' },
  ]
},
{
  id: 'oop', title: 'Structs and classes', blurb: 'Constructors, primary constructors, inheritance with open and override, properties.',
  body: [
    ['h', 'Structs'],
    ['p', 'A struct is a value type with member variables, constructors (<code>init</code>) and member functions. Members are <code>internal</code> unless you add <code>public</code>, <code>protected</code> or <code>private</code>.'],
    ['code', `struct Rectangle {
    let width: Int64
    let height: Int64

    public init(width: Int64, height: Int64) {
        this.width = width
        this.height = height
    }

    public func area(): Int64 {
        width * height
    }
}

main() {
    let r = Rectangle(3, 4)
    println(r.area())
}`, '12'],
    ['p', 'A <b>primary constructor</b> declares members and the constructor at once. There can be at most one:'],
    ['code', `struct Size {
    public Size(let width: Int64, let height: Int64) {}
}`],
    ['h', 'Changing a struct with mut func'],
    ['p', 'Struct member functions cannot change the struct\'s fields unless they are marked <code>mut</code>. The instance must be a <code>var</code> to call one. <code>mut</code> is allowed in structs, struct extensions and interfaces, but not in classes, and a mut function cannot be static.'],
    ['code', `struct Tally {
    var n: Int64 = 0

    public mut func bump() {
        n += 1
    }
}

main() {
    var t = Tally()
    t.bump()
    t.bump()
    println(t.n)
}`, '2'],
    ['h', 'Classes and inheritance'],
    ['p', 'Classes are reference types. A class inherits with <code>&lt;:</code> from one parent, which must be <code>open</code> or <code>abstract</code>. Overridable members are <code>open</code> and the subclass marks its version <code>override</code>. Calls dispatch dynamically.'],
    ['code', `open class Animal {
    public open func speak(): String {
        "..."
    }
}

class Dog <: Animal {
    public override func speak(): String {
        "Woof"
    }
}

main() {
    let a: Animal = Dog()
    println(a.speak())
}`, 'Woof'],
    ['p', 'Call the parent constructor with <code>super(…)</code> or another constructor with <code>this(…)</code>, as the first expression in <code>init</code>. An <code>abstract class</code> cannot be instantiated. A <code>sealed</code> class can only be inherited inside its package. Static functions are replaced with <code>redef</code>.'],
    ['h', 'Properties'],
    ['p', '<code>prop</code> defines a getter. <code>mut prop</code> also needs a setter, and the setter parameter must be named.'],
    ['code', `class Counter {
    private var n = 0

    public mut prop value: Int64 {
        get() { n }
        set(v) { n = v }
    }
}

main() {
    let c = Counter()
    c.value = 5
    println(c.value)
}`, '5'],
  ],
  quiz: [
    { q: 'Why does <code>class Cat &lt;: Animal</code> fail when Animal is declared as <code>class Animal {}</code>?', o: ['Animal is not <code>open</code>', 'Classes cannot inherit', 'You must write <code>extends</code>', 'Cat needs an init'], a: 0, why: 'Only open or abstract classes can be inherited.' },
    { q: 'Is <code>class C &lt;: A &amp; B</code> valid when A and B are both classes?', o: ['No, a class has only one parent class', 'Yes, always', 'Only if both are open', 'Only inside one package'], a: 0, why: 'Classes support single inheritance. <code>&amp;</code> is for listing interfaces.' },
    { q: 'Which keyword does a subclass use for its version of an open method?', o: ['<code>override</code>', '<code>redef</code>', '<code>open</code>', '<code>virtual</code>'], a: 0, why: '<code>redef</code> is for static functions.' },
    { q: 'Where must <code>super(30)</code> appear in an <code>init</code>?', o: ['As the first expression', 'As the last expression', 'Anywhere', 'Outside the body'], a: 0, why: 'Constructor chaining calls come first.' },
    { q: 'With <code>let t = Tally()</code>, what does calling the mut function <code>t.bump()</code> do?', o: ['Compile error', 'Updates t', 'Updates a copy of t', 'Runtime exception'], a: 0, why: 'A mut function needs a mutable instance, so t must be declared with var.' },
    { q: 'Where is a <code>mut func</code> <b>not</b> allowed?', o: ['In a class', 'In a struct', 'In an interface', 'In a struct extension'], a: 0, why: 'Classes are reference types and prohibit mut functions.' },
    { q: 'What does <code>public prop size: Int64 { get() { 0 } }</code> declare?', o: ['A read-only property', 'A writable property', 'A static constant', 'A method named get'], a: 0, why: 'Without <code>mut</code> a property only has a getter.' },
  ]
},
{
  id: 'iface', title: 'Interfaces and extensions', blurb: 'Contracts with interface, multiple implementation, and adding behavior with extend.',
  body: [
    ['h', 'Interfaces'],
    ['p', 'An interface lists members a type must provide. A type can implement several interfaces with <code>&lt;: A &amp; B</code>. Implementations must be <code>public</code>. Interfaces can also provide default implementations and static members.'],
    ['code', `interface Shape {
    func area(): Int64
}

class Square <: Shape {
    let side: Int64
    public init(side: Int64) {
        this.side = side
    }
    public func area(): Int64 {
        side * side
    }
}

main() {
    let s: Shape = Square(5)
    println(s.area())
}`, '25'],
    ['p', 'Every non-interface type implements the built-in <code>Any</code> interface.'],
    ['h', 'Extensions'],
    ['p', '<code>extend</code> adds member functions, operators and properties to an existing type, or makes it implement an interface, without touching its source.'],
    ['code', `extend Int64 {
    public func isEven(): Bool {
        this % 2 == 0
    }
}

main() {
    let n: Int64 = 4
    println(n.isEven())
}`, 'true'],
    ['code', `interface Describable {
    func describe(): String
}

extend String <: Describable {
    public func describe(): String {
        "a string of \${this.size} bytes"
    }
}

main() {
    println("hello".describe())
}`, 'a string of 5 bytes'],
    ['note', '<strong>Rules for extend:</strong> no new member variables, every function and property needs a body, no <code>open</code>, <code>override</code> or <code>redef</code>, and no access to the type\'s <code>private</code> members. Functions, tuples and interfaces cannot be extended.'],
  ],
  quiz: [
    { q: 'How does a class implement two interfaces?', o: ['<code>class X &lt;: A &amp; B</code>', '<code>class X implements A, B</code>', '<code>class X : A, B</code>', '<code>class X &lt;: A, B</code>'], a: 0, why: 'Interfaces are joined with <code>&amp;</code> after <code>&lt;:</code>.' },
    { q: 'Which of these can an extension <b>not</b> add?', o: ['A member variable', 'A member function', 'A property', 'An interface implementation'], a: 0, why: 'Extensions cannot add stored state.' },
    { q: 'Can an extension read the extended type\'s <code>private</code> members?', o: ['No', 'Yes', 'Only in the same file', 'Only with <code>unsafe</code>'], a: 0, why: 'Private members stay private to the original type.' },
    { q: 'An implementing class leaves out <code>public</code> on the interface method. What happens?', o: ['Compile error', 'It becomes private', 'It works with a warning', 'The default is used'], a: 0, why: 'Interface implementations must be public.' },
  ]
},
{
  id: 'enum', title: 'Enums, match and Option', blurb: 'Enums with payloads, exhaustive match, guards, Option and if-let.',
  body: [
    ['h', 'Enums'],
    ['p', 'Each constructor is listed after <code>|</code> and can carry values. Enums can be recursive and can have member functions and properties.'],
    ['code', `enum RGBColor {
    | Red | Green | Blue(UInt8)
}

enum Expr {
    | Num(Int64)
    | Add(Expr, Expr)
}`],
    ['p', 'Ending the list with <code>| ...</code> marks the enum non-exhaustive, so code matching on it needs a catch-all case.'],
    ['h', 'match'],
    ['p', '<code>match</code> must cover every possibility. Patterns include constants, <code>_</code>, bindings, enum constructors and type patterns (<code>case v: T</code>). <code>where</code> adds a guard.'],
    ['code', `enum RGBColor {
    | Red | Green | Blue(UInt8)
}

func describe(c: RGBColor): String {
    match (c) {
        case Red => "red"
        case Green => "green"
        case Blue(v) where v > 128 => "bright blue"
        case Blue(_) => "blue"
    }
}

main() {
    println(describe(Blue(200)))
    println(describe(Red))
}`, 'bright blue\nred'],
    ['p', 'Without a subject, each case is a Boolean condition:'],
    ['code', `main() {
    let x = -3
    let sign = match {
        case x > 0 => "positive"
        case x < 0 => "negative"
        case _ => "zero"
    }
    println(sign)
}`, 'negative'],
    ['p', 'Tuple patterns match the shape and values of a tuple, and type patterns test the runtime type:'],
    ['code', `main() {
    let person = ("Bob", 30)
    let text = match (person) {
        case ("Bob", age) => "Bob is \${age}"
        case (name, _) => "Someone called \${name}"
    }
    println(text)
}`, 'Bob is 30'],
    ['h', 'Option'],
    ['p', '<code>Option&lt;T&gt;</code> is the enum <code>Some(T) | None</code>, with the shorthand <code>?T</code>. A plain value is wrapped automatically: <code>let a: ?Int64 = 100</code>. Unwrap it with <code>if (let Some(v) &lt;- opt)</code>, with <code>??</code> for a fallback, or with <code>getOrThrow()</code>.'],
    ['code', `func find(name: String): ?Int64 {
    if (name == "a") { Some(1) } else { None }
}

main() {
    if (let Some(v) <- find("a")) {
        println("found \${v}")
    } else {
        println("missing")
    }
    println(find("z") ?? 0)
}`, 'found 1\n0'],
    ['p', 'Optional chaining with <code>?.</code> reads a member when the value is <code>Some</code> and yields <code>None</code> otherwise. <code>getOrThrow()</code> returns the value, or throws <code>NoneValueException</code> on <code>None</code>.'],
    ['code', `struct User {
    let age: Int64 = 30
}

main() {
    let someone: ?User = User()
    let nobody: ?User = None
    println(someone?.age ?? -1)
    println(nobody?.age ?? -1)
}`, '30\n-1'],
  ],
  quiz: [
    { q: '<code>?String</code> is shorthand for…', o: ['<code>Option&lt;String&gt;</code>', 'A nullable pointer', '<code>String | Unit</code>', 'An optional parameter'], a: 0, why: 'The <code>?T</code> form means Option&lt;T&gt;.' },
    { q: 'What is required of a <code>match</code> expression?', o: ['It covers every possible value', 'It has at most 8 cases', 'It ends with <code>default</code>', 'It only matches integers'], a: 0, why: 'Matches must be exhaustive, often with a final <code>case _</code>.' },
    { q: 'Which is the correct if-let syntax?', o: ['<code>if (let Some(v) &lt;- opt)</code>', '<code>if let Some(v) = opt</code>', '<code>if (opt is Some(v))</code>', '<code>if (Some(v) := opt)</code>'], a: 0, why: 'Cangjie uses <code>&lt;-</code> to destructure in a condition.' },
    { q: 'What does <code>let a: ?Int64 = None</code> then <code>a ?? 7</code> evaluate to?', o: ['7', 'None', '0', 'An exception'], a: 0, why: '<code>??</code> returns the right side when the Option is None.' },
    { q: 'What does <code>x?.a</code> give when <code>x</code> is <code>None</code>?', o: ['<code>None</code>', 'A NoneValueException', '0', 'A compile error'], a: 0, why: 'Optional chaining short-circuits to None.' },
    { q: 'What does <code>getOrThrow()</code> throw on <code>None</code>?', o: ['<code>NoneValueException</code>', '<code>NullPointerException</code>', '<code>IllegalStateException</code>', 'Nothing, it returns 0'], a: 0, why: 'Catch it with <code>catch (e: NoneValueException)</code>.' },
    { q: 'What does <code>| ...</code> at the end of an enum mean?', o: ['The enum is non-exhaustive', 'It has infinite constructors', 'It is generic', 'It repeats the previous constructor'], a: 0, why: 'Matches on it then need a wildcard case.' },
  ]
},
{
  id: 'gen', title: 'Generics', blurb: 'Generic functions and classes, and constraints with where.',
  body: [
    ['p', 'Type parameters go in angle brackets after the name. With no constraint, a type parameter supports almost nothing, so you add constraints with <code>where</code>.'],
    ['code', `func id<T>(a: T): T {
    a
}

func show<T>(a: T) where T <: ToString {
    println(a)
}

main() {
    println(id(7))
    show<Int64>(10)
    show("text")
}`, '7\n10\ntext'],
    ['table', [['Write', 'Meaning'], ['<code>where T &lt;: ToString</code>', 'T must implement ToString'], ['<code>where T &lt;: A &amp; B</code>', 'T must satisfy both A and B'], ['<code>where T &lt;: A, U &lt;: B</code>', 'Separate constraints for T and U'], ['<code>where T &lt;: Animal</code>', 'T must be Animal or a subclass']]],
    ['h', 'Generic classes'],
    ['code', `class Box<T> {
    var item: T

    public init(item: T) {
        this.item = item
    }

    public func get(): T {
        item
    }
}

main() {
    let b = Box<String>("gift")
    println(b.get())
}`, 'gift'],
    ['p', 'A generic map node from the docs: <code>open class Node&lt;K, V&gt; where K &lt;: Hashable &amp; Equatable&lt;K&gt;</code>. Constraints must be interfaces or concrete class types.'],
  ],
  quiz: [
    { q: 'How do you require <code>T</code> to implement <code>ToString</code>?', o: ['<code>where T &lt;: ToString</code>', '<code>&lt;T: ToString&gt;</code>', '<code>&lt;T extends ToString&gt;</code>', '<code>requires T is ToString</code>'], a: 0, why: 'Constraints go in a <code>where</code> clause with <code>&lt;:</code>.' },
    { q: 'How do you put two constraints on the same type parameter?', o: ['<code>where T &lt;: A &amp; B</code>', '<code>where T &lt;: A, T &lt;: B</code> only', '<code>where T &lt;: A | B</code>', '<code>where T &lt;: (A, B)</code>'], a: 0, why: '<code>&amp;</code> combines constraints on one parameter. Commas separate constraints on different parameters.' },
    { q: 'Inside <code>func f&lt;T&gt;(a: T)</code> with no constraint, can you call <code>a.toString()</code>?', o: ['No', 'Yes, every type has it', 'Only for classes', 'Only at runtime'], a: 0, why: 'An unconstrained T has no known members.' },
    { q: 'Which is a valid generic class instantiation?', o: ['<code>Box&lt;String&gt;("gift")</code>', '<code>Box[String]("gift")</code>', '<code>new Box&lt;String&gt;("gift")</code>', '<code>Box::&lt;String&gt;("gift")</code>'], a: 0, why: 'There is no <code>new</code> keyword. Type arguments use angle brackets.' },
  ]
},
{
  id: 'err', title: 'Error handling', blurb: 'throw, try/catch/finally, custom exceptions, and try-with-resources.',
  body: [
    ['p', 'Cangjie separates <code>Error</code> (internal system failures you should not throw) from <code>Exception</code> (problems your program can catch). Only Exception subtypes can be thrown, so custom exceptions extend <code>Exception</code>.'],
    ['code', `class InsufficientFunds <: Exception {
    public init(msg: String) {
        super(msg)
    }
}

func withdraw(balance: Int64, amount: Int64): Int64 {
    if (amount > balance) {
        throw InsufficientFunds("need \${amount - balance} more")
    }
    balance - amount
}

main() {
    try {
        withdraw(10, 25)
    } catch (e: InsufficientFunds) {
        println("Error: \${e.message}")
    } finally {
        println("done")
    }
}`, 'Error: need 15 more\ndone'],
    ['h', 'Catch patterns'],
    ['p', 'Catch several types with <code>catch (e: IllegalArgumentException | NegativeArraySizeException)</code>, or anything with <code>catch (_)</code>. A <code>try</code> needs at least a <code>catch</code> or a <code>finally</code>, and <code>try</code> is an expression:'],
    ['code', `let x = try {
    parseInput()
} catch (e: Exception) {
    0
}`],
    ['h', 'try-with-resources'],
    ['p', 'Objects whose class implements the <code>Resource</code> interface (<code>isClosed(): Bool</code> and <code>close(): Unit</code>) are closed automatically. <code>catch</code> and <code>finally</code> are optional here, and the expression has type <code>Unit</code>.'],
    ['code', `try (r = Worker("Tom")) {
    r.work()
}`],
  ],
  quiz: [
    { q: 'What should a custom exception class inherit from?', o: ['<code>Exception</code>', '<code>Error</code>', '<code>Throwable</code>', '<code>Any</code>'], a: 0, why: 'Error is reserved for internal failures. Exception is for application code.' },
    { q: 'How do you catch two exception types in one block?', o: ['<code>catch (e: A | B)</code>', '<code>catch (e: A, B)</code>', '<code>catch (A or B)</code>', 'Two catches are required'], a: 0, why: 'Use <code>|</code> between the types.' },
    { q: 'What must a resource class implement for try-with-resources?', o: ['<code>Resource</code>, with <code>isClosed()</code> and <code>close()</code>', '<code>Closeable</code>', '<code>Disposable</code>', 'Nothing special'], a: 0, why: 'The <code>Resource</code> interface defines both methods.' },
    { q: 'When does a <code>finally</code> block run?', o: ['Whether or not an exception was thrown', 'Only when an exception was thrown', 'Only when none was thrown', 'Only if catch rethrows'], a: 0, why: 'finally always runs after try and any catch.' },
    { q: 'Which statement is true?', o: ['<code>try</code> can produce a value', '<code>try</code> is always <code>Unit</code>', 'Only functions can throw', '<code>catch</code> is mandatory'], a: 0, why: 'For example <code>let x = try { … } catch (e: Exception) { 0 }</code>.' },
  ]
},
{
  id: 'pkg', title: 'Packages and imports', blurb: 'Declaring packages, import forms, visibility and re-exports.',
  body: [
    ['p', 'The first line of a source file can declare its package: <code>package a.b</code>. Imports come next, before any other declaration. The <code>core</code> package is imported automatically.'],
    ['code', `// src/geometry/shapes.cj
package demo.geometry

public func square(n: Int64): Int64 {
    n * n
}`, null, 'src/geometry/shapes.cj'],
    ['code', `// src/main.cj
package demo

import demo.geometry.square

main(): Int64 {
    println(square(9))
    return 0
}`, '81', 'src/main.cj'],
    ['h', 'Import forms'],
    ['table', [['Form', 'Imports'], ['<code>import std.math.*</code>', 'Every visible declaration in the package'], ['<code>import p1.foo</code>', 'One declaration'], ['<code>import p1.{foo, bar}</code>', 'Several from one package'], ['<code>import {p1.foo, p2.bar}</code>', 'Several from different packages'], ['<code>import p2.f3 as f</code>', 'One declaration under a new name'], ['<code>public import a.b.f</code>', 'Re-exports f to importers of this package']]],
    ['p', 'Access levels are <code>public</code>, <code>protected</code>, <code>internal</code> (the default for declarations) and <code>private</code>. An <code>import</code> is private unless marked otherwise. Packages that import each other in a cycle are a compile error.'],
    ['h', 'Build with cjpm'],
    ['shell', `cjpm init        # create cjpm.toml and src/main.cj
cjpm build       # compile the project
cjpm run         # build and run`],
  ],
  quiz: [
    { q: 'Where must <code>import</code> statements go?', o: ['After <code>package</code> and before other declarations', 'Anywhere in the file', 'Inside <code>main</code>', 'At the end of the file'], a: 0, why: 'Order is package, then imports, then everything else.' },
    { q: 'How do you import <code>f3</code> from <code>p2</code> under the name <code>f</code>?', o: ['<code>import p2.f3 as f</code>', '<code>import f = p2.f3</code>', '<code>from p2 import f3 as f</code>', '<code>use p2::f3 as f</code>'], a: 0, why: '<code>as</code> renames an import.' },
    { q: 'Which package never needs an explicit import?', o: ['<code>core</code>', '<code>std.collection</code>', '<code>std.sync</code>', '<code>std.math</code>'], a: 0, why: 'core is imported implicitly, which is why <code>println</code> works everywhere.' },
    { q: 'Package A imports B and B imports A. What happens?', o: ['Compile error', 'It works', 'Runtime error on first call', 'Only public items load'], a: 0, why: 'Circular package dependencies are not allowed.' },
    { q: 'What does <code>public import a.b.f</code> do?', o: ['Imports f and re-exports it', 'Makes f public in package a.b', 'Imports every public item', 'Nothing different from import'], a: 0, why: 'Code that imports your package can then use f too.' },
  ]
},
{
  id: 'conc', title: 'Concurrency', blurb: 'spawn and Future, sleep, atomics, Mutex and synchronized.',
  body: [
    ['p', '<code>spawn { => … }</code> starts a lightweight thread and returns a <code>Future&lt;T&gt;</code>, where T is the lambda\'s result type. <code>get()</code> waits for the result. Child threads stop when <code>main</code> ends, so wait for any work you need.'],
    ['code', `import std.sync.*
import std.time.*

main(): Int64 {
    let fut = spawn { =>
        sleep(100 * Duration.millisecond)
        6 * 7
    }
    println("waiting...")
    println(fut.get())
    return 0
}`, 'waiting...\n42'],
    ['p', '<code>fut.get(Duration.millisecond * 10)</code> waits at most that long and throws <code>TimeoutException</code> if the thread has not finished.'],
    ['h', 'Atomics'],
    ['p', 'From <code>std.sync</code>: <code>AtomicInt8</code> to <code>AtomicUInt64</code>, plus <code>AtomicBool</code> and <code>AtomicReference</code>. Integer atomics offer <code>load</code>, <code>store</code>, <code>swap</code>, <code>compareAndSwap</code>, <code>fetchAdd</code>, <code>fetchSub</code>, <code>fetchAnd</code>, <code>fetchOr</code>, <code>fetchXor</code>.'],
    ['code', `import std.sync.*
import std.collection.*

let count = AtomicInt64(0)

main(): Int64 {
    let futures = ArrayList<Future<Unit>>()
    for (_ in 0..1000) {
        let f = spawn { =>
            count.fetchAdd(1)
            ()
        }
        futures.add(f)
    }
    for (f in futures) {
        f.get()
    }
    println(count.load())
    return 0
}`, '1000'],
    ['h', 'Mutex and synchronized'],
    ['p', '<code>Mutex</code> is reentrant, with <code>lock()</code>, <code>unlock()</code> and <code>tryLock()</code>. <code>synchronized(mtx) { … }</code> locks for the block and releases it on any exit, including <code>break</code>, <code>return</code> and exceptions.'],
    ['code', `import std.sync.*

let mtx = Mutex()
var total = 0

main(): Int64 {
    let f1 = spawn { => synchronized(mtx) { total += 1 } }
    let f2 = spawn { => synchronized(mtx) { total += 1 } }
    f1.get()
    f2.get()
    println(total)
    return 0
}`, '2'],
    ['p', 'A <code>Condition</code> from <code>mtx.condition()</code> gives <code>wait()</code>, <code>notify()</code> and <code>notifyAll()</code>. Hold the lock when you use it, and wait in a loop.'],
  ],
  quiz: [
    { q: 'What does <code>spawn { => 42 }</code> return?', o: ['<code>Future&lt;Int64&gt;</code>', '<code>Int64</code>', '<code>Thread</code>', '<code>Unit</code>'], a: 0, why: 'Call <code>get()</code> on the Future to wait for 42.' },
    { q: 'What happens to running child threads when <code>main</code> returns?', o: ['They stop', 'main waits for them', 'They keep running in the background', 'The program crashes'], a: 0, why: 'Use <code>get()</code> to wait for threads whose work matters.' },
    { q: 'How do you sleep for half a second?', o: ['<code>sleep(500 * Duration.millisecond)</code>', '<code>sleep(500)</code>', '<code>Thread.sleep(500)</code>', '<code>wait(0.5)</code>'], a: 0, why: 'sleep takes a Duration.' },
    { q: 'An exception is thrown inside <code>synchronized(mtx) { … }</code>. What happens to the lock?', o: ['It is released', 'It stays locked', 'The program deadlocks', 'Exceptions are not allowed there'], a: 0, why: 'synchronized releases the lock on every exit path.' },
    { q: 'Which call atomically adds 1 to an <code>AtomicInt64</code>?', o: ['<code>count.fetchAdd(1)</code>', '<code>count++</code>', '<code>count.add(1)</code>', '<code>atomic { count += 1 }</code>'], a: 0, why: 'fetchAdd adds and returns the previous value.' },
  ]
},
];

/* Questions that appear only in the final exam */
const EXAM_EXTRA = [
  { q: 'What does this print?', code: 'main() {\n    var x = 0\n    for (i in 0..5) {\n        x += i\n    }\n    println(x)\n}', o: ['10', '15', '5', '0'], a: 0, why: '0 + 1 + 2 + 3 + 4 = 10, because <code>0..5</code> excludes 5.', from: 'Control flow' },
  { q: 'What does this print?', code: 'main() {\n    let n = 10\n    let r = if (n > 5) { "big" } else { "small" }\n    println(r)\n}', o: ['big', 'small', 'true', 'It does not compile'], a: 0, why: 'if is an expression and yields "big".', from: 'Control flow' },
  { q: 'Which literal is a <code>UInt8</code>?', o: ['<code>255u8</code>', '<code>255i8</code>', '<code>UInt8 255</code>', '<code>0x255</code>'], a: 0, why: '<code>u8</code> is the UInt8 suffix. 255 does not fit in Int8.', from: 'Basic data types' },
  { q: 'In Cangjie, <code>\'hi\'</code> is…', o: ['A String', 'A Rune', 'A compile error', 'A byte array'], a: 0, why: 'Strings may use single or double quotes. A Rune literal is written <code>r\'x\'</code>.', from: 'Basic data types' },
  { q: 'Which values does <code>0..=10 : 5</code> produce?', o: ['0 5 10', '0 5', '5 10', '0 10'], a: 0, why: 'Closed range, step 5.', from: 'Control flow' },
  { q: 'What does this print?', code: 'main() {\n    let a: ?Int64 = None\n    let b: ?Int64 = Some(3)\n    println((a ?? 1) + (b ?? 1))\n}', o: ['4', '2', '3', 'It throws'], a: 0, why: 'a falls back to 1 and b unwraps to 3.', from: 'Enums, match and Option' },
  { q: 'Which modifier lets a subclass redefine a parent\'s <b>static</b> function?', o: ['<code>redef</code>', '<code>override</code>', '<code>open</code>', '<code>static override</code>'], a: 0, why: 'override is for instance members, redef for static ones.', from: 'Structs and classes' },
  { q: 'What must a HashMap key type implement?', o: ['<code>Hashable</code> and <code>Equatable</code>', '<code>Comparable</code>', '<code>ToString</code>', 'Nothing'], a: 0, why: 'Hashing places the key and equality finds it.', from: 'Arrays and collections' },
  { q: 'What is the type of a try-with-resources expression?', o: ['<code>Unit</code>', 'The type of its last expression', '<code>Resource</code>', '<code>Option</code>'], a: 0, why: 'try-with-resources always has type Unit.', from: 'Error handling' },
  { q: 'What does this print?', code: 'func scale(v: Int64, by!: Int64 = 2): Int64 {\n    v * by\n}\n\nmain() {\n    println(scale(5) + scale(5, by: 3))\n}', o: ['25', '20', '30', 'It does not compile'], a: 0, why: '5 × 2 + 5 × 3 = 25.', from: 'Functions and lambdas' },
  { q: 'What does this print?', code: 'main() {\n    var t = (1, 2)\n    t = (3, 4)\n    println(t[0] + t[1])\n}', o: ['7', '3', 'It does not compile', '10'], a: 0, why: 'Tuple elements are immutable, but a var tuple can be replaced as a whole.', from: 'Basic data types' },
  { q: 'Which is <b>not</b> a valid range?', o: ['<code>0..10 : 0</code>', '<code>0..10 : 2</code>', '<code>10..0 : -1</code>', '<code>5..5</code>'], a: 0, why: 'The step cannot be 0. An empty range like 5..5 is allowed.', from: 'Control flow' },
  { q: 'What does this print?', code: 'main() {\n    let a = [1, 2, 3]\n    let b = a\n    b[0] = 9\n    println(a[0])\n}', o: ['9', '1', 'It does not compile', '0'], a: 0, why: 'Array is a reference type, so a and b share storage.', from: 'Variables and values' },
  { q: 'What does <code>synchronized(mtx) { … }</code> require?', o: ['A Mutex (or other lock) object', 'A Future', 'An atomic integer', 'A Duration'], a: 0, why: 'It locks the given lock for the block.', from: 'Concurrency' },
  { q: 'Which declaration of <code>main</code> appears in the cjpm template?', o: ['<code>main(): Int64</code>', '<code>func main(): void</code>', '<code>public static main()</code>', '<code>fn main()</code>'], a: 0, why: 'The template returns 0 from <code>main(): Int64</code>. <code>main()</code> without a return type is also valid.', from: 'Getting started' },
];


/* Further reading, shown on the References page */
const REFERENCES = [
  { group: 'Official documentation', items: [
    ['Cangjie documentation site', 'https://cangjie-lang.cn/en/docs', 'The developer guide, tools guide, API reference, white paper and language spec.', 'English, Chinese'],
    ['Documentation source', 'https://gitcode.com/Cangjie/cangjie_docs', 'The Markdown behind the docs, with a branch for each release line. Easiest to read when the site will not load.', 'English, Chinese'],
    ['Standard library overview', 'https://docs.cangjie-lang.cn/en/docs/1.0.0/libs/std/std_module_overview.html', 'Index of the std packages for 1.0.0, including collection, sync and time.', 'English'],
    ['Using Option', 'https://gitcode.com/Cangjie/cangjie_docs/blob/release%2F1.0/docs/dev-guide/source_en/error_handle/use_option.md', 'Pattern matching, ??, ?. and getOrThrow in depth.', 'English'],
    ['Patterns', 'https://gitcode.com/Cangjie/cangjie_docs/blob/release%2F1.0/docs/dev-guide/source_en/enum_and_pattern_match/pattern_overview.md', 'Every pattern kind, with examples.', 'English'],
    ['White paper: modern features', 'https://docs.cangjie-lang.cn/docs/0.53.18/white_paper/source_zh_cn/cj-wp-morefeatures.html', 'Why the language has pipelines, trailing lambdas and properties. Written for 0.53.18, so check syntax against 1.0.', 'Chinese'],
  ]},
  { group: 'Community tutorials', items: [
    ['Learn X in Y Minutes: Cangjie', 'https://learnxinyminutes.com/zh-cn/cangjie/', 'A single-page tour of the syntax.', 'Chinese'],
    ['Cangjie Programming Language Tutorial', 'https://gitee.com/waylau/cangjie-programming-language-tutorial', 'A free book with sample code. Mostly written for 0.53.13 and still in progress.', 'Chinese'],
  ]},
  { group: 'Tools and libraries', items: [
    ['Cangjie Playground', 'https://playground.cj.zxilly.dev', 'A community-run editor for trying Cangjie in the browser without installing the SDK.', 'Chinese'],
    ['awesome-cangjie', 'https://github.com/gtn1024/awesome-cangjie', 'A community list of frameworks, libraries, editors and tools.', 'Chinese'],
  ]},
];
