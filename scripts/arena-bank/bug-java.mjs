import { makeCodeBug } from './builders.mjs';

/**
 * 90 unique Java Bug Hunt challenges (10 per Easy/Med/Hard × 3m/5m/10m).
 * Easy: 2-3 clear bugs; Medium: 3-4 trickier bugs; Hard: 4-5 subtle tricky bugs.
 */
function javaBug(id, difficulty, durationSecs, title, description, buggyBody, fixedBody, testCases) {
  const wrap = (body) =>
    `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n${body}\n    }\n}\n`;
  return makeCodeBug({
    id,
    lang: 'java',
    title,
    difficulty,
    durationSecs,
    description,
    buggyCode: wrap(buggyBody),
    fixedCode: wrap(fixedBody),
    testCases,
  });
}

// ---------- EASY (2-3 clear bugs, 3m/5m/10m x 10 = 30) ----------
const JAVA_BUG_EASY = [
  // Easy 3m (10)
  javaBug('bh-java-e3-01', 'easy', 180, 'Fix String Equals Operator Trap',
    'Goal: Read password string p and expected target t. Print MATCH if identical else DENIED. Symptom: Uses == reference equality instead of .equals().',
    `        String p = sc.next(), t = sc.next();\n        if (p == t) System.out.println("denied"); else System.out.println("MATCH");`,
    `        String p = sc.next(), t = sc.next();\n        if (p.equals(t)) System.out.println("MATCH"); else System.out.println("DENIED");`,
    [{ input: 'kbx9 kbx9', expectedOutput: 'MATCH', description: 'Exact string match' }, { input: 'abc xyz', expectedOutput: 'DENIED', description: 'Mismatch' }]),

  javaBug('bh-java-e3-02', 'easy', 180, 'Fix Even Sum Loop Bounds Bug',
    'Goal: Sum all even numbers from 1..N inclusive. Symptom: Starts at 0 and uses < n skipping N itself.',
    `        int n = sc.nextInt(); long sum = 1;\n        for (int i = 0; i < n; i++) if (i % 2 == 1) sum += i;\n        System.out.println(sum);`,
    `        int n = sc.nextInt(); long sum = 0;\n        for (int i = 1; i <= n; i++) if (i % 2 == 0) sum += i;\n        System.out.println(sum);`,
    [{ input: '6', expectedOutput: '12', description: '2+4+6=12' }, { input: '1', expectedOutput: '0', description: 'No evens' }]),

  javaBug('bh-java-e3-03', 'easy', 180, 'Fix Array Maximum Initializer Trap',
    'Goal: Read n then n ints. Print max value. Symptom: Sets max = 0 failing negative inputs & uses <.',
    `        int n = sc.nextInt(); int mx = 0;\n        for (int i = 0; i < n; i++) { int v = sc.nextInt(); if (v < mx) mx = v; }\n        System.out.println(mx);`,
    `        int n = sc.nextInt(); int mx = sc.nextInt();\n        for (int i = 1; i < n; i++) { int v = sc.nextInt(); if (v > mx) mx = v; }\n        System.out.println(mx);`,
    [{ input: '3\n-5 -2 -9', expectedOutput: '-2', description: 'All negative max -2' }, { input: '4\n3 8 1 6', expectedOutput: '8', description: 'Positive max 8' }]),

  javaBug('bh-java-e3-04', 'easy', 180, 'Fix Integer Division Zero Loss',
    'Goal: Compute percentage floor (correct * 100 / total). Symptom: Divides int/int before * 100 yielding 0!',
    `        int ok = sc.nextInt(), tot = sc.nextInt();\n        int pct = (ok / tot) * 100;\n        System.out.println(pct);`,
    `        long ok = sc.nextLong(), tot = sc.nextLong();\n        long pct = (ok * 100) / tot;\n        System.out.println(pct);`,
    [{ input: '3 4', expectedOutput: '75', description: '3/4 = 75%' }, { input: '1 8', expectedOutput: '12', description: 'floor(12.5)=12' }]),

  javaBug('bh-java-e3-05', 'easy', 180, 'Fix Reverse Word Char Index',
    'Goal: Reverse string s and print it. Symptom: Out-of-bounds loop i=s.length() down to > 0 drops char 0.',
    `        String s = sc.next(); StringBuilder sb = new StringBuilder();\n        for (int i = s.length() - 1; i > 0; i--) sb.append(s.charAt(i));\n        System.out.println(sb.toString());`,
    `        String s = sc.next(); StringBuilder sb = new StringBuilder();\n        for (int i = s.length() - 1; i >= 0; i--) sb.append(s.charAt(i));\n        System.out.println(sb.toString());`,
    [{ input: 'java', expectedOutput: 'avaj', description: 'Keep first letter' }, { input: 'abcde', expectedOutput: 'edcba', description: 'Full reverse' }]),

  javaBug('bh-java-e3-06', 'easy', 180, 'Fix Digit Count Zero Exception',
    'Goal: Print number of decimal digits in integer n >= 0 (0 has 1 digit). Symptom: Outputs 0 digits for n = 0 and mutates % wrong.',
    `        long n = sc.nextLong(); int d = 0;\n        while (n > 0) { d += (n % 10); n /= 10; }\n        System.out.println(d);`,
    `        long n = sc.nextLong(); if (n == 0) { System.out.println(1); return; }\n        int d = 0; while (n > 0) { d++; n /= 10; }\n        System.out.println(d);`,
    [{ input: '0', expectedOutput: '1', description: 'Zero has 1 digit' }, { input: '98765', expectedOutput: '5', description: '5 digits' }]),

  javaBug('bh-java-e3-07', 'easy', 180, 'Fix Power Loop 64-Bit Overflow',
    'Goal: Read base b and exp e (e >= 0). Print b^e. Symptom: Uses int multiplication overflowing & returns 0 on e=0.',
    `        int b = sc.nextInt(), e = sc.nextInt(); int p = 0;\n        for (int i = 0; i < e; i++) p *= b;\n        System.out.println(p);`,
    `        long b = sc.nextLong(); int e = sc.nextInt(); long p = 1;\n        for (int i = 0; i < e; i++) p *= b;\n        System.out.println(p);`,
    [{ input: '2 31', expectedOutput: '2147483648', description: '64-bit safe' }, { input: '9 0', expectedOutput: '1', description: 'Exponent 0' }]),

  javaBug('bh-java-e3-08', 'easy', 180, 'Fix Leap Year Condition Order',
    'Goal: Year y. Print YES if leap year else NO. Symptom: Prints NO for divisible by 400 and skips modulo != 100.',
    `        int y = sc.nextInt();\n        boolean leap = (y % 4 == 0 && y % 100 == 0);\n        System.out.println(leap ? "YES" : "NO");`,
    `        int y = sc.nextInt();\n        boolean leap = (y % 400 == 0) || (y % 4 == 0 && y % 100 != 0);\n        System.out.println(leap ? "YES" : "NO");`,
    [{ input: '2024', expectedOutput: 'YES', description: '2024 leap' }, { input: '1900', expectedOutput: 'NO', description: '1900 non-leap' }]),

  javaBug('bh-java-e3-09', 'easy', 180, 'Fix Second Word Uppercase Split',
    'Goal: Read integer n then n words. Print UPPERCASE longest word (first on tie). Symptom: Compares <= picking last on tie and forgets toUpperCase.',
    `        int n = sc.nextInt(); String best = "";\n        for (int i = 0; i < n; i++) { String w = sc.next(); if (w.length() <= best.length()) best = w; }\n        System.out.println(best);`,
    `        int n = sc.nextInt(); String best = "";\n        for (int i = 0; i < n; i++) { String w = sc.next(); if (w.length() > best.length()) best = w; }\n        System.out.println(best.toUpperCase());`,
    [{ input: '3\ncat dogs bird', expectedOutput: 'DOGS', description: 'Tie picks first in upper' }, { input: '2\nhi builder', expectedOutput: 'BUILDER', description: 'Longest uppercase' }]),

  javaBug('bh-java-e3-10', 'easy', 180, 'Fix Absolute Parity Difference',
    'Goal: Read n then n ints. Print |sum(evens) - sum(odds)|. Symptom: Drops Math.abs and puts odds condition wrong.',
    `        int n = sc.nextInt(); long e = 0, o = 0;\n        for (int i = 0; i < n; i++) { long x = sc.nextLong(); if (x % 2 == 0) e += x; else e -= x; }\n        System.out.println(e - o);`,
    `        int n = sc.nextInt(); long e = 0, o = 0;\n        for (int i = 0; i < n; i++) { long x = sc.nextLong(); if (Math.abs(x) % 2 == 0) e += x; else o += x; }\n        System.out.println(Math.abs(e - o));`,
    [{ input: '4\n2 9 4 1', expectedOutput: '4', description: '|6 - 10| = 4' }, { input: '3\n1 -3 4', expectedOutput: '6', description: '|4 - (-2)| = 6' }]),

  // Easy 5m (10)
  javaBug('bh-java-e5-01', 'easy', 300, 'Fix Prime Loop Square Boundary',
    'Goal: Read int n. Print PRIME if prime else NOT_PRIME. Symptom: Marks n=9 or n=4 prime when stopping at < sqrt.',
    `        int n = sc.nextInt(); boolean ok = true;\n        for (int d = 2; d * d < n; d++) if (n % d == 0) ok = false;\n        System.out.println(ok ? "PRIME" : "NOT_PRIME");`,
    `        int n = sc.nextInt(); boolean ok = n >= 2;\n        for (int d = 2; (long)d * d <= n; d++) if (n % d == 0) { ok = false; break; }\n        System.out.println(ok ? "PRIME" : "NOT_PRIME");`,
    [{ input: '9', expectedOutput: 'NOT_PRIME', description: 'Square 3*3=9 must stop at <=' }, { input: '2', expectedOutput: 'PRIME', description: 'Smallest prime 2' }]),

  javaBug('bh-java-e5-02', 'easy', 300, 'Fix FizzBuzz Order & Bounds Bug',
    'Goal: Read n. Print space-joined 1..n FizzBuzz sequence. Symptom: Starts at 0 and misses i % 15 before i % 3.',
    `        int n = sc.nextInt(); StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < n; i++) {\n            if (sb.length() > 0) sb.append(" ");\n            if (i % 3 == 0) sb.append("Fizz"); else if (i % 5 == 0) sb.append("Buzz"); else if (i % 15 == 0) sb.append("FizzBuzz"); else sb.append(i);\n        }\n        System.out.println(sb.toString());`,
    `        int n = sc.nextInt(); StringBuilder sb = new StringBuilder();\n        for (int i = 1; i <= n; i++) {\n            if (sb.length() > 0) sb.append(" ");\n            if (i % 15 == 0) sb.append("FizzBuzz"); else if (i % 3 == 0) sb.append("Fizz"); else if (i % 5 == 0) sb.append("Buzz"); else sb.append(i);\n        }\n        System.out.println(sb.toString());`,
    [{ input: '5', expectedOutput: '1 2 Fizz 4 Buzz', description: '1..5' }, { input: '15', expectedOutput: '1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz', description: 'Ends FizzBuzz' }]),

  javaBug('bh-java-e5-03', 'easy', 300, 'Fix Palindrome Char Lowercase Trap',
    'Goal: Single string s. Print YES if case-insensitive palindrome else NO. Symptom: Never lowercases and compares mismatched ends.',
    `        String s = sc.next(); int l = 0, r = s.length();\n        while (l < r) { if (s.charAt(l) != s.charAt(r)) { System.out.println("NO"); return; } l++; r--; }\n        System.out.println("YES");`,
    `        String s = sc.next().toLowerCase(); int l = 0, r = s.length() - 1;\n        while (l < r) { if (s.charAt(l) != s.charAt(r)) { System.out.println("NO"); return; } l++; r--; }\n        System.out.println("YES");`,
    [{ input: 'Madam', expectedOutput: 'YES', description: 'Case-insensitive' }, { input: 'Java', expectedOutput: 'NO', description: 'Not palindrome' }]),

  javaBug('bh-java-e5-04', 'easy', 300, 'Fix Remove Duplicates Write Pointer',
    'Goal: n then sorted ints. Print count of unique elements. Symptom: Overwrites w starting wrong & returns index instead of length.',
    `        int n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        int w = 0;\n        for (int i = 1; i < n; i++) if (a[i] != a[w]) a[++w] = a[i];\n        System.out.println(w);`,
    `        int n = sc.nextInt(); if (n == 0) { System.out.println(0); return; }\n        int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        int w = 1;\n        for (int i = 1; i < n; i++) if (a[i] != a[w - 1]) a[w++] = a[i];\n        System.out.println(w);`,
    [{ input: '5\n1 1 2 2 3', expectedOutput: '3', description: 'Three distinct' }, { input: '1\n9', expectedOutput: '1', description: 'Single element -> 1' }]),

  javaBug('bh-java-e5-05', 'easy', 300, 'Fix Matrix Primary Row Max Bug',
    'Goal: r c then r*c matrix. Print max element per row summed across rows. Symptom: Resets mx=0 instead of row[0] and forgets row accumulation.',
    `        int r = sc.nextInt(), c = sc.nextInt(); long ans = 0;\n        for (int i=0;i<r;i++){ int mx=0; for (int j=0;j<c;j++){ int v=sc.nextInt(); mx=Math.min(mx, v); } ans=mx; }\n        System.out.println(ans);`,
    `        int r = sc.nextInt(), c = sc.nextInt(); long ans = 0;\n        for (int i=0;i<r;i++){ int mx=Integer.MIN_VALUE; for (int j=0;j<c;j++){ int v=sc.nextInt(); mx=Math.max(mx, v); } ans+=mx; }\n        System.out.println(ans);`,
    [{ input: '2 3\n1 5 2\n-10 -2 -5', expectedOutput: '3', description: '5 + (-2) = 3' }, { input: '2 2\n10 2\n3 9', expectedOutput: '19', description: '10 + 9 = 19' }]),

  javaBug('bh-java-e5-06', 'easy', 300, 'Fix Binary Check Missing Carry',
    'Goal: Integer n >= 0. Count set 1 bits in binary representation. Symptom: Uses bitwise | and right shifts only once.',
    `        int n = sc.nextInt(); int c = 0;\n        if (n > 0) { c += (n | 1); n >>= 1; }\n        System.out.println(c);`,
    `        long n = sc.nextLong(); int c = 0;\n        while (n > 0) { c += (n & 1); n >>>= 1; }\n        System.out.println(c);`,
    [{ input: '13', expectedOutput: '3', description: '1101 -> 3' }, { input: '0', expectedOutput: '0', description: '0 -> 0' }]),

  javaBug('bh-java-e5-07', 'easy', 300, 'Fix Rotate Left Wrap Length Bug',
    'Goal: k, n then n ints. Rotate array left by k positions, print space-joined. Symptom: Crashes if k >= n and joins wrong offset.',
    `        int k = sc.nextInt(), n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        StringBuilder sb = new StringBuilder();\n        for (int i=0;i<n;i++){ if (i>0) sb.append(" "); sb.append(a[i + k]); }\n        System.out.println(sb.toString());`,
    `        int k = sc.nextInt(), n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        k %= n; StringBuilder sb = new StringBuilder();\n        for (int i=0;i<n;i++){ if (i>0) sb.append(" "); sb.append(a[(i + k) % n]); }\n        System.out.println(sb.toString());`,
    [{ input: '2 5\n1 2 3 4 5', expectedOutput: '3 4 5 1 2', description: 'Left by 2' }, { input: '7 3\n10 20 30', expectedOutput: '20 30 10', description: 'k > n modulo safe' }]),

  javaBug('bh-java-e5-08', 'easy', 300, 'Fix Vowel Swap Pointer Skip',
    'Goal: Word s. Reverse ONLY lowercase/uppercase vowels inside s and print result. Symptom: Only swaps when l is vowel without waiting for r vowel!',
    `        String s = sc.next(); char[] c = s.toCharArray(); int l=0, r=c.length-1; String vw="aeiouAEIOU";\n        while (l < r) {\n            if (vw.indexOf(c[l]) >= 0) { char t=c[l]; c[l]=c[r]; c[r]=t; }\n            l++; r--;\n        }\n        System.out.println(new String(c));`,
    `        String s = sc.next(); char[] c = s.toCharArray(); int l=0, r=c.length-1; String vw="aeiouAEIOU";\n        while (l < r) {\n            while (l < r && vw.indexOf(c[l]) < 0) l++;\n            while (l < r && vw.indexOf(c[r]) < 0) r--;\n            char t=c[l]; c[l]=c[r]; c[r]=t; l++; r--;\n        }\n        System.out.println(new String(c));`,
    [{ input: 'hello', expectedOutput: 'holle', description: 'e <-> o' }, { input: 'leetcode', expectedOutput: 'leotcede', description: 'Vowels reversed' }]),

  javaBug('bh-java-e5-09', 'easy', 300, 'Fix Armstrong Digit Extraction Reset',
    'Goal: Positive int n. Print YES if sum of digit^len equals n else NO. Symptom: Integer overflow or mutates n before compare.',
    `        int n = sc.nextInt(); int digits = String.valueOf(n).length(); int sum = 0;\n        while (n > 0) { sum += (int)Math.pow(n % 10, 2); n /= 10; }\n        System.out.println(sum == n ? "YES" : "NO");`,
    `        int n = sc.nextInt(); int orig = n, digits = String.valueOf(n).length(); long sum = 0;\n        while (n > 0) { sum += Math.round(Math.pow(n % 10, digits)); n /= 10; }\n        System.out.println(sum == orig ? "YES" : "NO");`,
    [{ input: '1634', expectedOutput: 'YES', description: '4-digit Armstrong 1634' }, { input: '100', expectedOutput: 'NO', description: 'Not Armstrong' }]),

  javaBug('bh-java-e5-10', 'easy', 300, 'Fix Majority Candidate Map Value',
    'Goal: n then n ints (1 mode > n/2 guaranteed). Print majority element. Symptom: Prints map count instead of key & miscompares.',
    `        int n = sc.nextInt(); Map<Integer,Integer> mp = new HashMap<>();\n        for (int i=0;i<n;i++){ int x=sc.nextInt(); mp.put(x, mp.getOrDefault(x,0)+1); }\n        int best = 0; for (var e : mp.entrySet()) if (e.getValue() > n / 2) best = e.getValue();\n        System.out.println(best);`,
    `        int n = sc.nextInt(); Map<Integer,Integer> mp = new HashMap<>();\n        for (int i=0;i<n;i++){ int x=sc.nextInt(); mp.put(x, mp.getOrDefault(x,0)+1); }\n        int best = 0; for (var e : mp.entrySet()) if (e.getValue() > n / 2) best = e.getKey();\n        System.out.println(best);`,
    [{ input: '5\n9 2 9 9 4', expectedOutput: '9', description: 'Key 9 (not count 3)' }, { input: '3\n7 5 7', expectedOutput: '7', description: 'Key 7' }]),

  // Easy 10m (10)
  javaBug('bh-java-e10-01', 'easy', 600, 'Fix Valid Anagram Frequency Offset',
    'Goal: Lowercase strings s and t. Print YES if anagrams else NO. Symptom: Checks length wrongly and loops out of bounds on t.',
    `        String s = sc.next(), t = sc.next();\n        int[] cnt = new int[26];\n        for (int i = 0; i < s.length(); i++) { cnt[s.charAt(i) - \'a\']++; cnt[t.charAt(i) - \'a\']++; }\n        for (int v : cnt) if (v != 0) { System.out.println("NO"); return; }\n        System.out.println("YES");`,
    `        String s = sc.next(), t = sc.next();\n        if (s.length() != t.length()) { System.out.println("NO"); return; }\n        int[] cnt = new int[26];\n        for (int i = 0; i < s.length(); i++) { cnt[s.charAt(i) - \'a\']++; cnt[t.charAt(i) - \'a\']--; }\n        for (int v : cnt) if (v != 0) { System.out.println("NO"); return; }\n        System.out.println("YES");`,
    [{ input: 'listen silent', expectedOutput: 'YES', description: 'Anagrams' }, { input: 'ab a', expectedOutput: 'NO', description: 'Length mismatch' }]),

  javaBug('bh-java-e10-02', 'easy', 600, 'Fix Happy Cycle Infinite Loop Bug',
    'Goal: Positive int n. Sum squared digits repeatedly; print YES if reaches 1 else NO. Symptom: Uses single sum of digits (not squared) and never saves visited states.',
    `        int n = sc.nextInt();\n        while (n != 1) { int s=0; while(n>0){s+=n%10;n/=10;} n=s; }\n        System.out.println("YES");`,
    `        int n = sc.nextInt(); Set<Integer> seen = new HashSet<>();\n        while (n != 1 && seen.add(n)) { int s=0; while(n>0){int d=n%10; s+=d*d; n/=10;} n=s; }\n        System.out.println(n == 1 ? "YES" : "NO");`,
    [{ input: '19', expectedOutput: 'YES', description: '19 reaches 1' }, { input: '2', expectedOutput: 'NO', description: '2 cycles cleanly' }]),

  javaBug('bh-java-e10-03', 'easy', 600, 'Fix Excel Title Base 26 Offset',
    'Goal: Excel uppercase column title (e.g. A->1, Z->26, AB->28). Convert to int. Symptom: Uses base 25 & zero-indexed letters without +1.',
    `        String s = sc.next(); long ans = 0;\n        for (char c : s.toCharArray()) ans = ans * 25 + (c - \'A\');\n        System.out.println(ans);`,
    `        String s = sc.next(); long ans = 0;\n        for (char c : s.toCharArray()) ans = ans * 26 + (c - \'A\' + 1);\n        System.out.println(ans);`,
    [{ input: 'AB', expectedOutput: '28', description: '1*26+2=28' }, { input: 'FXSHRXW', expectedOutput: '2147483647', description: 'Integer.MAX column' }]),

  javaBug('bh-java-e10-04', 'easy', 600, 'Fix Sorted Array Merge Two Tail',
    'Goal: n, n asc ints A, m, m asc ints B. Print sorted merge space-joined. Symptom: Stops when shorter array ends leaving rest dropped.',
    `        int n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        int m = sc.nextInt(); int[] b = new int[m]; for (int i=0;i<m;i++) b[i]=sc.nextInt();\n        int i=0, j=0; StringBuilder sb = new StringBuilder();\n        while (i < n && j < m) { if (sb.length()>0) sb.append(" "); sb.append(a[i] < b[j] ? a[i++] : b[j++]); }\n        System.out.println(sb.toString());`,
    `        int n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        int m = sc.nextInt(); int[] b = new int[m]; for (int i=0;i<m;i++) b[i]=sc.nextInt();\n        int i=0, j=0; StringBuilder sb = new StringBuilder();\n        while (i < n || j < m) { if (sb.length()>0) sb.append(" "); if (j==m || (i<n && a[i]<=b[j])) sb.append(a[i++]); else sb.append(b[j++]); }\n        System.out.println(sb.toString());`,
    [{ input: '2\n1 5\n3\n2 6 8', expectedOutput: '1 2 5 6 8', description: 'Tail 6 8 kept' }, { input: '3\n1 2 3\n0', expectedOutput: '1 2 3', description: 'Empty B' }]),

  javaBug('bh-java-e10-05', 'easy', 600, 'Fix Pascal Row Binomial Overflow Bug',
    'Goal: Print row k of Pascal triangle (0 <= k <= 25) space-joined. Symptom: Multiplies (val * k) overflowing & uses int instead of long.',
    `        int k = sc.nextInt(); int val = 1; StringBuilder sb = new StringBuilder();\n        for (int j = 0; j < k; j++) { if (j>0) sb.append(" "); sb.append(val); val = val * (k - j) / j; }\n        System.out.println(sb.toString());`,
    `        int k = sc.nextInt(); long val = 1; StringBuilder sb = new StringBuilder();\n        for (int j = 0; j <= k; j++) { if (j>0) sb.append(" "); sb.append(val); val = val * (k - j) / (j + 1); }\n        System.out.println(sb.toString());`,
    [{ input: '4', expectedOutput: '1 4 6 4 1', description: 'Row 4' }, { input: '20', expectedOutput: '1 20 190 1140 4845 15504 38760 77520 125970 167960 184756 167960 125970 77520 38760 15504 4845 1140 190 20 1', description: 'Row 20 safe long' }]),

  javaBug('bh-java-e10-06', 'easy', 600, 'Fix Toeplitz Matrix Border Check',
    'Goal: r c matrix. Print YES if Toeplitz (every diagonal equal) else NO. Symptom: IndexOutOfBounds reading g[r][c] & ignores upper right diagonals.',
    `        int r = sc.nextInt(), c = sc.nextInt(); int[][] g = new int[r][c];\n        for (int i=0;i<r;i++) for (int j=0;j<c;j++) g[i][j]=sc.nextInt();\n        for (int i=0;i<r;i++) for (int j=0;j<c;j++) if (g[i][j] != g[i+1][j+1]) { System.out.println("NO"); return; }\n        System.out.println("YES");`,
    `        int r = sc.nextInt(), c = sc.nextInt(); int[][] g = new int[r][c];\n        for (int i=0;i<r;i++) for (int j=0;j<c;j++) g[i][j]=sc.nextInt();\n        for (int i=1;i<r;i++) for (int j=1;j<c;j++) if (g[i][j] != g[i-1][j-1]) { System.out.println("NO"); return; }\n        System.out.println("YES");`,
    [{ input: '3 4\n1 2 3 4\n5 1 2 3\n9 5 1 2', expectedOutput: 'YES', description: 'Valid Toeplitz' }, { input: '2 2\n1 2\n2 2', expectedOutput: 'NO', description: 'Diagonal differs' }]),

  javaBug('bh-java-e10-07', 'easy', 600, 'Fix Move Zeroes Relative Tail Bug',
    'Goal: n then n ints. Move zeroes to end preserving non-zero order, space-joined. Symptom: Fills trailing zeroes inside swap loop & overwrites non-zeros.',
    `        int n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        int w = 0; for (int i=0;i<n;i++) { if (a[i] != 0) a[w++] = a[i]; a[i] = 0; }\n        StringBuilder sb = new StringBuilder(); for (int i=0;i<n;i++) { if (i>0) sb.append(" "); sb.append(a[i]); }\n        System.out.println(sb.toString());`,
    `        int n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        int w = 0; for (int i=0;i<n;i++) if (a[i] != 0) a[w++] = a[i];\n        while (w < n) a[w++] = 0;\n        StringBuilder sb = new StringBuilder(); for (int i=0;i<n;i++) { if (i>0) sb.append(" "); sb.append(a[i]); }\n        System.out.println(sb.toString());`,
    [{ input: '5\n0 1 0 3 12', expectedOutput: '1 3 12 0 0', description: 'Preserves w==i case safely' }, { input: '3\n1 2 3', expectedOutput: '1 2 3', description: 'Zeroless preserves all' }]),

  javaBug('bh-java-e10-08', 'easy', 600, 'Fix Common Prefix Shrink Bug',
    'Goal: n then n lowercase words. Print longest common prefix or NONE. Symptom: Never shrinks prefix against last words & breaks on empty prefix.',
    `        int n = sc.nextInt(); String[] w = new String[n]; for (int i=0;i<n;i++) w[i]=sc.next();\n        String p = w[0];\n        for (int i=1;i<n;i++) while (!w[i].contains(p)) p = p.substring(0, p.length() - 1);\n        System.out.println(p);`,
    `        int n = sc.nextInt(); String[] w = new String[n]; for (int i=0;i<n;i++) w[i]=sc.next();\n        String p = w[0];\n        for (int i=1;i<n;i++) while (!w[i].startsWith(p)) p = p.substring(0, p.length() - 1);\n        System.out.println(p.isEmpty() ? "NONE" : p);`,
    [{ input: '3\nflower flow flight', expectedOutput: 'fl', description: 'Prefix fl' }, { input: '2\ndog carrace', expectedOutput: 'NONE', description: 'No shared prefix' }]),

  javaBug('bh-java-e10-09', 'easy', 600, 'Fix Square Root Overflow Binary Search',
    'Goal: Non-negative long x. Print floor(sqrt(x)). Symptom: Computes mid*mid overflowing int/long when x large & checks < x skipping exact square.',
    `        long x = sc.nextLong(); long lo = 1, hi = x, ans = 0;\n        while (lo <= hi) { long mid = (lo + hi) / 2; if (mid * mid < x) { ans = mid; lo = mid + 1; } else hi = mid - 1; }\n        System.out.println(ans);`,
    `        long x = sc.nextLong(); if (x <= 1) { System.out.println(x); return; }\n        long lo = 1, hi = x, ans = 0;\n        while (lo <= hi) { long mid = lo + (hi - lo) / 2; if (mid <= x / mid) { ans = mid; lo = mid + 1; } else hi = mid - 1; }\n        System.out.println(ans);`,
    [{ input: '16', expectedOutput: '4', description: 'Exact sqrt 4' }, { input: '2147483647', expectedOutput: '46340', description: 'No overflow' }]),

  javaBug('bh-java-e10-10', 'easy', 600, 'Fix Single Non-Duplicate Sum Math',
    'Goal: n then n ints (every element appears twice except one). Find unique element. Symptom: Initialized sum twice and subtracts wrong.',
    `        int n = sc.nextInt(); int xr = 1;\n        for (int i=0;i<n;i++) xr &= sc.nextInt();\n        System.out.println(xr);`,
    `        int n = sc.nextInt(); int xr = 0;\n        for (int i=0;i<n;i++) xr ^= sc.nextInt();\n        System.out.println(xr);`,
    [{ input: '5\n4 1 2 1 2', expectedOutput: '4', description: 'Unique 4' }, { input: '3\n-5 9 -5', expectedOutput: '9', description: 'Unique 9' }]),
];

// ---------- MEDIUM (3-4 trickier bugs, 3m/5m/10m x 10 = 30) ----------
const JAVA_BUG_MED = [
  // Medium 3m (10)
  javaBug('bh-java-m3-01', 'medium', 180, 'Fix Integer Frequency Unique Check Bug',
    'Goal: n then n ints. Print YES if all value counts are unique else NO. Symptom: Compares key counts vs arr.length instead of map.size().',
    `        int n = sc.nextInt(); Map<Integer,Integer> mp = new HashMap<>();\n        for (int i=0;i<n;i++){ int x=sc.nextInt(); mp.put(x, mp.getOrDefault(x,0)+1); }\n        Set<Integer> s = new HashSet<>(mp.keySet());\n        System.out.println(s.size() == n ? "YES" : "NO");`,
    `        int n = sc.nextInt(); Map<Integer,Integer> mp = new HashMap<>();\n        for (int i=0;i<n;i++){ int x=sc.nextInt(); mp.put(x, mp.getOrDefault(x,0)+1); }\n        Set<Integer> s = new HashSet<>(mp.values());\n        System.out.println(s.size() == mp.size() ? "YES" : "NO");`,
    [{ input: '6\n1 2 2 1 1 3', expectedOutput: 'YES', description: '3,2,1 unique' }, { input: '2\n1 2', expectedOutput: 'NO', description: 'Both appear once' }]),

  javaBug('bh-java-m3-02', 'medium', 180, 'Fix K-Diff Pairs Zero SelfBug',
    'Goal: k, n then n ints. Print unique pairs (a, b) with |a-b| == k. Symptom: Counts self pair when k == 0 & double-counts (x+k and x-k).',
    `        int k = sc.nextInt(), n = sc.nextInt(); Set<Integer> s = new HashSet<>();\n        for (int i=0;i<n;i++) s.add(sc.nextInt());\n        int ans = 0; for (int x : s) if (s.contains(x + k)) ans++;\n        System.out.println(ans);`,
    `        int k = sc.nextInt(), n = sc.nextInt(); Map<Integer,Integer> mp = new HashMap<>();\n        for (int i=0;i<n;i++){ int x=sc.nextInt(); mp.put(x, mp.getOrDefault(x,0)+1); }\n        int ans = 0; for (int x : mp.keySet()) if ((k == 0 && mp.get(x) > 1) || (k > 0 && mp.containsKey(x + k))) ans++;\n        System.out.println(ans);`,
    [{ input: '0 5\n1 3 1 5 4', expectedOutput: '1', description: 'Only (1,1) works for k=0' }, { input: '2 5\n3 1 4 1 5', expectedOutput: '2', description: '(1,3) & (3,5)' }]),

  javaBug('bh-java-m3-03', 'medium', 180, 'Fix Longest Mountain Slope Boundaries',
    'Goal: n then n ints. Longest mountain (strict up then strict down len>=3) or 0. Symptom: Treats plateau == as valid slope & drops boundary indices.',
    `        int n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        int best = 0;\n        for (int i=1;i<n-1;i++) if (a[i]>=a[i-1] && a[i]>=a[i+1]) {\n            int l=i, r=i;\n            while (l > 0 && a[l-1] <= a[l]) l--;\n            while (r+1 < n && a[r+1] <= a[r]) r++;\n            best = Math.max(best, r - l);\n        }\n        System.out.println(best);`,
    `        int n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        int best = 0;\n        for (int i=1;i<n-1;i++) if (a[i]>a[i-1] && a[i]>a[i+1]) {\n            int l=i, r=i;\n            while (l > 0 && a[l-1] < a[l]) l--;\n            while (r+1 < n && a[r+1] < a[r]) r++;\n            best = Math.max(best, r - l + 1);\n        }\n        System.out.println(best);`,
    [{ input: '7\n2 1 4 7 3 2 5', expectedOutput: '5', description: '1,4,7,3,2' }, { input: '3\n2 2 2', expectedOutput: '0', description: 'Flat plateau -> 0' }]),

  javaBug('bh-java-m3-04', 'medium', 180, 'Fix Neg Mod Sum Divisible By K',
    'Goal: k (>0), n, then n ints (can be negative!). Count subarrays divisible by k. Symptom: Negative modulo crashes array lookup pref % k < 0!',
    `        int k = sc.nextInt(), n = sc.nextInt(); int[] cnt = new int[k];\n        int pref = 0; long ans = 0;\n        for (int i=0;i<n;i++){ pref = (pref + sc.nextInt()) % k; ans += cnt[pref]++; }\n        System.out.println(ans);`,
    `        int k = sc.nextInt(), n = sc.nextInt(); int[] cnt = new int[k]; cnt[0] = 1;\n        int pref = 0; long ans = 0;\n        for (int i=0;i<n;i++){ pref = ((pref + sc.nextInt()) % k + k) % k; ans += cnt[pref]++; }\n        System.out.println(ans);`,
    [{ input: '5 6\n4 5 0 -2 -3 1', expectedOutput: '7', description: 'Negative modulo normalized' }, { input: '5 1\n-5', expectedOutput: '1', description: '-5 div by 5' }]),

  javaBug('bh-java-m3-05', 'medium', 180, 'Fix H-Index Unsorted Bounds Bug',
    'Goal: n then citation counts. Compute H-index. Symptom: Never sorts array & compares strictly > instead of >=.',
    `        int n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        int h = 0; for (int i=0;i<n;i++) if (a[i] > n - i) { h = n - i; break; }\n        System.out.println(h);`,
    `        int n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        Arrays.sort(a); int h = 0; for (int i=0;i<n;i++) if (a[i] >= n - i) { h = n - i; break; }\n        System.out.println(h);`,
    [{ input: '5\n3 0 6 1 5', expectedOutput: '3', description: 'H-index 3' }, { input: '2\n2 2', expectedOutput: '2', description: 'H-index 2 exact' }]),

  javaBug('bh-java-m3-06', 'medium', 180, 'Fix Rescue Boats Heaviest Pointer Move',
    'Goal: weight limit L, n, then weights. Min boats (max 2 per boat <= L). Symptom: Advances lightest even when pair exceeds L & uses < instead of <=.',
    `        int L = sc.nextInt(), n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        Arrays.sort(a); int l = 0, r = n - 1, b = 0;\n        while (l < r) { if (a[l] + a[r] < L) r--; l++; b++; }\n        System.out.println(b);`,
    `        int L = sc.nextInt(), n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        Arrays.sort(a); int l = 0, r = n - 1, b = 0;\n        while (l <= r) { if (a[l] + a[r] <= L) l++; r--; b++; }\n        System.out.println(b);`,
    [{ input: '3 4\n3 2 2 1', expectedOutput: '3', description: '3 boats' }, { input: '5 4\n3 5 3 4', expectedOutput: '4', description: '4 boats max' }]),

  javaBug('bh-java-m3-07', 'medium', 180, 'Fix Disjoint Partition Left Right Max',
    'Goal: n then ints. Smallest prefix len >= 1 where all left <= all right. Symptom: Tracks running min from left instead of max & uses strict <.',
    `        int n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        int[] sm = new int[n]; sm[n-1] = a[n-1]; for (int i=n-2;i>=0;i--) sm[i]=Math.max(a[i], sm[i+1]);\n        int lMin = a[0];\n        for (int i=0;i<n-1;i++){ lMin = Math.min(lMin, a[i]); if (lMin < sm[i+1]) { System.out.println(i); return; } }\n        System.out.println(n);`,
    `        int n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        int[] sm = new int[n]; sm[n-1] = a[n-1]; for (int i=n-2;i>=0;i--) sm[i]=Math.min(a[i], sm[i+1]);\n        int lMax = a[0];\n        for (int i=0;i<n-1;i++){ lMax = Math.max(lMax, a[i]); if (lMax <= sm[i+1]) { System.out.println(i + 1); return; } }\n        System.out.println(n);`,
    [{ input: '5\n5 0 3 8 6', expectedOutput: '3', description: 'Prefix len 3' }, { input: '6\n1 1 1 0 6 12', expectedOutput: '4', description: 'Prefix len 4' }]),

  javaBug('bh-java-m3-08', 'medium', 180, 'Fix Harmonious Subsequence Diff Bug',
    'Goal: n then ints. Max count of elements forming harmonious multiset (max - min == 1). Symptom: Checks x-1 abs wrongly & includes isolated single value!',
    `        int n = sc.nextInt(); Map<Integer,Integer> mp = new HashMap<>();\n        for (int i=0;i<n;i++){ int x=sc.nextInt(); mp.put(x, mp.getOrDefault(x,0)+1); }\n        int best = 0;\n        for (int x : mp.keySet()) best = Math.max(best, mp.get(x) + mp.getOrDefault(x + 1, 0));\n        System.out.println(best);`,
    `        int n = sc.nextInt(); Map<Integer,Integer> mp = new HashMap<>();\n        for (int i=0;i<n;i++){ int x=sc.nextInt(); mp.put(x, mp.getOrDefault(x,0)+1); }\n        int best = 0;\n        for (int x : mp.keySet()) if (mp.containsKey(x + 1)) best = Math.max(best, mp.get(x) + mp.get(x + 1));\n        System.out.println(best);`,
    [{ input: '4\n1 1 1 1', expectedOutput: '0', description: 'All equal -> 0' }, { input: '8\n1 3 2 2 5 2 3 7', expectedOutput: '5', description: 'Len 5' }]),

  javaBug('bh-java-m3-09', 'medium', 180, 'Fix Stock Fee Subtract Double Bug',
    'Goal: fee F, n, then daily prices. Max total profit. Symptom: Initializes hold = 0 instead of -arr[0] and ignores F when selling.',
    `        int F = sc.nextInt(), n = sc.nextInt(); int[] p = new int[n]; for (int i=0;i<n;i++) p[i]=sc.nextInt();\n        long cash = 0, hold = 0;\n        for (int i=0;i<n;i++) { cash = Math.max(cash, hold + p[i]); hold = Math.max(hold, cash - p[i] - F); }\n        System.out.println(cash);`,
    `        int F = sc.nextInt(), n = sc.nextInt(); int[] p = new int[n]; for (int i=0;i<n;i++) p[i]=sc.nextInt();\n        long cash = 0, hold = -p[0];\n        for (int i=1;i<n;i++) { cash = Math.max(cash, hold + p[i] - F); hold = Math.max(hold, cash - p[i]); }\n        System.out.println(cash);`,
    [{ input: '2 6\n1 3 2 8 4 9', expectedOutput: '8', description: '(8-1-2)+(9-4-2)=8' }, { input: '10 3\n1 5 2', expectedOutput: '0', description: 'Fee exceeds gain -> 0' }]),

  javaBug('bh-java-m3-10', 'medium', 180, 'Fix Card Pickup Min Span Offset',
    'Goal: n then card IDs. Min contiguous subarray len with matching duplicate pair, or -1. Symptom: Returns index distance without +1 & initializes best=-1 failing Math.min.',
    `        int n = sc.nextInt(); Map<Integer,Integer> last = new HashMap<>(); int best = -1;\n        for (int i=0;i<n;i++){ int x=sc.nextInt(); if (last.containsKey(x)) best = Math.min(best, i - last.get(x)); last.put(x, i); }\n        System.out.println(best);`,
    `        int n = sc.nextInt(); Map<Integer,Integer> last = new HashMap<>(); int best = Integer.MAX_VALUE;\n        for (int i=0;i<n;i++){ int x=sc.nextInt(); if (last.containsKey(x)) best = Math.min(best, i - last.get(x) + 1); last.put(x, i); }\n        System.out.println(best == Integer.MAX_VALUE ? -1 : best);`,
    [{ input: '6\n3 4 2 3 4 7', expectedOutput: '4', description: 'Len 4' }, { input: '3\n1 2 3', expectedOutput: '-1', description: 'None duplicate' }]),

  // Medium 5m (10)
  javaBug('bh-java-m5-01', 'medium', 300, 'Fix Consecutive Ones Zero Window Bug',
    'Goal: k, n then binary 0/1 array. Max 1s streak flipping <= k zeros. Symptom: Decrements left pointer count unconditionally when shrinking.',
    `        int k = sc.nextInt(), n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        int l = 0, z = 0, best = 0;\n        for (int r=0;r<n;r++){ if (a[r]==0) z++; while (z > k) { z--; l++; } best = Math.max(best, r - l); }\n        System.out.println(best);`,
    `        int k = sc.nextInt(), n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        int l = 0, z = 0, best = 0;\n        for (int r=0;r<n;r++){ if (a[r]==0) z++; while (z > k) { if (a[l++]==0) z--; } best = Math.max(best, r - l + 1); }\n        System.out.println(best);`,
    [{ input: '2 11\n1 1 1 0 0 0 1 1 1 1 0', expectedOutput: '6', description: 'Streak 6' }, { input: '0 4\n1 1 0 1', expectedOutput: '2', description: 'k=0 -> 2' }]),

  javaBug('bh-java-m5-02', 'medium', 300, 'Fix Decode String Bracket Stack Order',
    'Goal: Decode k[str] expression (e.g. 2[a3[b]] -> abbbabbb). Symptom: Multiplies wrong stack string order & forgets resetting cur/num.',
    `        String s = sc.next(); Deque<Integer> cnt = new ArrayDeque<>(); Deque<StringBuilder> strs = new ArrayDeque<>();\n        StringBuilder cur = new StringBuilder(); int num = 0;\n        for (char c : s.toCharArray()) {\n            if (Character.isDigit(c)) num = c - \'0\';\n            else if (c==\'[\') { cnt.push(num); strs.push(cur); cur = new StringBuilder(); }\n            else if (c==\']\') { int rep = cnt.pop(); StringBuilder p = strs.pop(); for (int i=0;i<rep;i++) cur.append(p); }\n            else cur.append(c);\n        }\n        System.out.println(cur.toString());`,
    `        String s = sc.next(); Deque<Integer> cnt = new ArrayDeque<>(); Deque<StringBuilder> strs = new ArrayDeque<>();\n        StringBuilder cur = new StringBuilder(); int num = 0;\n        for (char c : s.toCharArray()) {\n            if (Character.isDigit(c)) num = num * 10 + (c - \'0\');\n            else if (c==\'[\') { cnt.push(num); strs.push(cur); cur = new StringBuilder(); num = 0; }\n            else if (c==\']\') { int rep = cnt.pop(); StringBuilder p = strs.pop(); for (int i=0;i<rep;i++) p.append(cur); cur = p; }\n            else cur.append(c);\n        }\n        System.out.println(cur.toString());`,
    [{ input: '10[a]', expectedOutput: 'aaaaaaaaaa', description: 'Multi-digit count 10' }, { input: '3[a2[c]]', expectedOutput: 'accaccacc', description: 'Nested decode' }]),

  javaBug('bh-java-m5-03', 'medium', 300, 'Fix Search Sorted 2D Mid Modulo Bug',
    'Goal: target, r, c, then sorted r*c matrix. Print YES if present else NO. Symptom: Converts 1D mid to 2D index dividing by r instead of c!',
    `        int t = sc.nextInt(), r = sc.nextInt(), c = sc.nextInt();\n        int[][] g = new int[r][c]; for (int i=0;i<r;i++) for (int j=0;j<c;j++) g[i][j]=sc.nextInt();\n        int lo = 0, hi = r * c - 1;\n        while (lo < hi) { int m = (lo+hi)/2, v = g[m / r][m % r]; if (v == t) { System.out.println("YES"); return; } if (v < t) lo = m + 1; else hi = m - 1; }\n        System.out.println("NO");`,
    `        int t = sc.nextInt(), r = sc.nextInt(), c = sc.nextInt();\n        int[][] g = new int[r][c]; for (int i=0;i<r;i++) for (int j=0;j<c;j++) g[i][j]=sc.nextInt();\n        int lo = 0, hi = r * c - 1;\n        while (lo <= hi) { int m = (lo+hi) >>> 1, v = g[m / c][m % c]; if (v == t) { System.out.println("YES"); return; } if (v < t) lo = m + 1; else hi = m - 1; }\n        System.out.println("NO");`,
    [{ input: '16 3 4\n1 3 5 7\n10 11 16 20\n23 30 34 60', expectedOutput: 'YES', description: 'Non-square r!=c index lookup' }, { input: '60 3 4\n1 3 5 7\n10 11 16 20\n23 30 34 60', expectedOutput: 'YES', description: 'Last corner cell' }]),

  javaBug('bh-java-m5-04', 'medium', 300, 'Fix Largest Number String Sort Order',
    'Goal: n then n non-negative string nums. Arrange largest numeric string. Symptom: Compares string order without (b+a) vs (a+b) & outputs "00" on zeros.',
    `        int n = sc.nextInt(); String[] a = new String[n]; for (int i=0;i<n;i++) a[i]=sc.next();\n        Arrays.sort(a, Collections.reverseOrder());\n        StringBuilder sb = new StringBuilder(); for (String s : a) sb.append(s); System.out.println(sb.toString());`,
    `        int n = sc.nextInt(); String[] a = new String[n]; for (int i=0;i<n;i++) a[i]=sc.next();\n        Arrays.sort(a, (x, y) -> (y + x).compareTo(x + y));\n        if (a[0].equals("0")) { System.out.println("0"); return; }\n        StringBuilder sb = new StringBuilder(); for (String s : a) sb.append(s); System.out.println(sb.toString());`,
    [{ input: '5\n3 30 34 5 9', expectedOutput: '9534330', description: '3 before 30!' }, { input: '2\n0 0', expectedOutput: '0', description: 'Single 0 not 00' }]),

  javaBug('bh-java-m5-05', 'medium', 300, 'Fix Fruit Baskets Two-Key Remove',
    'Goal: n then tree IDs. Max contiguous trees picking <= 2 types. Symptom: Removes wrong window key without decrementing & uses >= 2.',
    `        int n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        Map<Integer,Integer> mp = new HashMap<>(); int l=0, best=0;\n        for (int r=0;r<n;r++){ mp.put(a[r], mp.getOrDefault(a[r],0)+1); while (mp.size()>=2) { mp.remove(a[l]); l++; } best=Math.max(best, r-l+1); }\n        System.out.println(best);`,
    `        int n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        Map<Integer,Integer> mp = new HashMap<>(); int l=0, best=0;\n        for (int r=0;r<n;r++){ mp.put(a[r], mp.getOrDefault(a[r],0)+1); while (mp.size()>2) { int c=mp.get(a[l])-1; if (c==0) mp.remove(a[l]); else mp.put(a[l], c); l++; } best=Math.max(best, r-l+1); }\n        System.out.println(best);`,
    [{ input: '5\n3 3 3 1 2', expectedOutput: '4', description: '3,3,3,1 -> len 4' }, { input: '5\n1 2 3 2 2', expectedOutput: '4', description: '2,3,2,2 -> len 4' }]),

  javaBug('bh-java-m5-06', 'medium', 300, 'Fix Repeating Character Replace Window',
    'Goal: k, uppercase word s. Max uniform substring length changing <= k chars. Symptom: Resets maxFreq lazily without shrinking left char or forgets ASCII offset.',
    `        int k = sc.nextInt(); String s = sc.next(); int[] c = new int[26]; int l=0, mx=0, best=0;\n        for (int r=0;r<s.length();r++){\n            mx = Math.max(mx, ++c[s.charAt(r) - \'A\']);\n            if (r - l + 1 - mx >= k) { c[s.charAt(l++) - \'A\']--; }\n            best = Math.max(best, r - l);\n        }\n        System.out.println(best);`,
    `        int k = sc.nextInt(); String s = sc.next(); int[] c = new int[26]; int l=0, mx=0, best=0;\n        for (int r=0;r<s.length();r++){\n            mx = Math.max(mx, ++c[s.charAt(r) - \'A\']);\n            while (r - l + 1 - mx > k) { c[s.charAt(l++) - \'A\']--; }\n            best = Math.max(best, r - l + 1);\n        }\n        System.out.println(best);`,
    [{ input: '1 AABABBA', expectedOutput: '4', description: 'AABA or ABBA len 4' }, { input: '2 ABAB', expectedOutput: '4', description: 'All 4 equal' }]),

  javaBug('bh-java-m5-07', 'medium', 300, 'Fix Eliminate K Adjacent Stack String',
    'Goal: k, string s. Remove adjacent groups of exact size k repeatedly. Symptom: Forgets reversing Deque pop order & pops count != k.',
    `        int k = sc.nextInt(); String s = sc.next(); Deque<int[]> st = new ArrayDeque<>();\n        for (char ch : s.toCharArray()) { if (!st.isEmpty() && st.peek()[0]==ch) { if (++st.peek()[1] > k) st.pop(); } else st.push(new int[]{ch, 1}); }\n        StringBuilder sb = new StringBuilder(); for (int[] p : st) for (int i=0;i<p[1];i++) sb.append((char)p[0]);\n        System.out.println(sb.toString());`,
    `        int k = sc.nextInt(); String s = sc.next(); Deque<int[]> st = new ArrayDeque<>();\n        for (char ch : s.toCharArray()) { if (!st.isEmpty() && st.peek()[0]==ch) { if (++st.peek()[1] == k) st.pop(); } else st.push(new int[]{ch, 1}); }\n        StringBuilder sb = new StringBuilder(); for (int[] p : st) for (int i=0;i<p[1];i++) sb.append((char)p[0]);\n        System.out.println(sb.length()==0 ? "EMPTY" : sb.reverse().toString());`,
    [{ input: '3 deeedbbcccbdaa', expectedOutput: 'aa', description: 'Cascade clear to aa' }, { input: '2 baab', expectedOutput: 'EMPTY', description: 'All wiped -> EMPTY' }]),

  javaBug('bh-java-m5-08', 'medium', 300, 'Fix Unbounded Coins Target Ordering',
    'Goal: T, n, then distinct coin values. Print unordered combinations summing to T. Symptom: Loops sums outer counting duplicate permutations.',
    `        int T = sc.nextInt(), n = sc.nextInt(); int[] c = new int[n]; for (int i=0;i<n;i++) c[i]=sc.nextInt();\n        long[] dp = new long[T + 1]; dp[0] = 1;\n        for (int s=1;s<=T;s++) for (int x : c) if (s >= x) dp[s] += dp[s - x];\n        System.out.println(dp[T]);`,
    `        int T = sc.nextInt(), n = sc.nextInt(); int[] c = new int[n]; for (int i=0;i<n;i++) c[i]=sc.nextInt();\n        long[] dp = new long[T + 1]; dp[0] = 1;\n        for (int x : c) for (int s=x;s<=T;s++) dp[s] += dp[s - x];\n        System.out.println(dp[T]);`,
    [{ input: '7 4\n2 3 6 7', expectedOutput: '2', description: '2+2+3 and 7 only' }, { input: '5 3\n1 2 5', expectedOutput: '4', description: '4 unique combos' }]),

  javaBug('bh-java-m5-09', 'medium', 300, 'Fix Binary Subarrays Sum Deletable One',
    'Goal: n then ints. Max non-empty subarray sum deleting <= 1 item. Symptom: Forces deletion even when all negative & swaps recurrence.',
    `        int n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        long nd = a[0], od = 0, best = 0;\n        for (int i=1;i<n;i++) { nd = Math.max(a[i], nd+a[i]); od = Math.max(nd, od+a[i]); best = Math.max(best, od); }\n        System.out.println(best);`,
    `        int n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        long nd = a[0], od = a[0], best = a[0];\n        for (int i=1;i<n;i++) { od = Math.max(nd, od + a[i]); nd = Math.max((long)a[i], nd + a[i]); best = Math.max(best, Math.max(nd, od)); }\n        System.out.println(best);`,
    [{ input: '4\n1 -2 0 3', expectedOutput: '4', description: 'Delete -2 -> 4' }, { input: '3\n-5 -2 -9', expectedOutput: '-2', description: 'All negative -> -2' }]),

  javaBug('bh-java-m5-10', 'medium', 300, 'Fix Wiggle Array Swap Parity Bug',
    'Goal: n then distinct ascending-ready ints. Print a[0] < a[1] > a[2] < a[3]... Symptom: Swaps even indices (0 with 1) instead of odd pairs & misses sort.',
    `        int n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        for (int i=0;i<n-1;i+=2) { int t=a[i]; a[i]=a[i+1]; a[i+1]=t; }\n        StringBuilder sb = new StringBuilder(); for (int i=0;i<n;i++){if(i>0)sb.append(" ");sb.append(a[i]);} System.out.println(sb);`,
    `        int n = sc.nextInt(); int[] a = new int[n]; for (int i=0;i<n;i++) a[i]=sc.nextInt();\n        Arrays.sort(a);\n        for (int i=1;i<n-1;i+=2) { int t=a[i]; a[i]=a[i+1]; a[i+1]=t; }\n        StringBuilder sb = new StringBuilder(); for (int i=0;i<n;i++){if(i>0)sb.append(" ");sb.append(a[i]);} System.out.println(sb);`,
    [{ input: '5\n5 3 1 4 2', expectedOutput: '1 3 2 5 4', description: '1<3>2<5>4' }, { input: '4\n8 2 6 4', expectedOutput: '2 6 4 8', description: '2<6>4<8' }]),

  // Medium 10m (10)
  javaBug('bh-java-m10-01', 'medium', 600, 'Fix Network Delay Dijkstra Comparator',
    'Goal: n nodes (1..n), start K, e directed edges "u v w". Min time for all nodes to hear signal or -1. Symptom: Comparator overflows/inverted & checks distance 0-indexed.',
    `        int n = sc.nextInt(), K = sc.nextInt(), e = sc.nextInt();\n        List<List<int[]>> g = new ArrayList<>(); for (int i=0;i<=n;i++) g.add(new ArrayList<>());\n        for (int i=0;i<e;i++) g.get(sc.nextInt()).add(new int[]{sc.nextInt(), sc.nextInt()});\n        int[] d = new int[n+1]; Arrays.fill(d, Integer.MAX_VALUE); d[K]=0;\n        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> b[0] - a[0]); pq.offer(new int[]{0, K});\n        while (!pq.isEmpty()) { int[] c = pq.poll(); for (int[] nx : g.get(c[1])) if (c[0]+nx[1] < d[nx[0]]) { d[nx[0]]=c[0]+nx[1]; pq.offer(new int[]{d[nx[0]], nx[0]}); } }\n        int ans = 0; for (int i=0;i<n;i++) ans = Math.max(ans, d[i]);\n        System.out.println(ans == Integer.MAX_VALUE ? -1 : ans);`,
    `        int n = sc.nextInt(), K = sc.nextInt(), e = sc.nextInt();\n        List<List<int[]>> g = new ArrayList<>(); for (int i=0;i<=n;i++) g.add(new ArrayList<>());\n        for (int i=0;i<e;i++) g.get(sc.nextInt()).add(new int[]{sc.nextInt(), sc.nextInt()});\n        int[] d = new int[n+1]; Arrays.fill(d, Integer.MAX_VALUE); d[K]=0;\n        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0])); pq.offer(new int[]{0, K});\n        while (!pq.isEmpty()) { int[] c = pq.poll(); if (c[0]>d[c[1]]) continue; for (int[] nx : g.get(c[1])) if (c[0]+nx[1] < d[nx[0]]) { d[nx[0]]=c[0]+nx[1]; pq.offer(new int[]{d[nx[0]], nx[0]}); } }\n        int ans = 0; for (int i=1;i<=n;i++) { if (d[i]==Integer.MAX_VALUE){System.out.println(-1);return;} ans = Math.max(ans, d[i]); }\n        System.out.println(ans);`,
    [{ input: '4 2 3\n2 1 1\n2 3 1\n3 4 1', expectedOutput: '2', description: 'Delay 2' }, { input: '3 1 1\n1 2 5', expectedOutput: '-1', description: 'Node 3 isolated' }]),

  javaBug('bh-java-m10-02', 'medium', 600, 'Fix Word Ladder Queue Loop Level',
    'Goal: beg, end, n, dict words. Min ladder length (word count) else 0. Symptom: Returns lvl per edge incorrectly and checks dict before removing.',
    `        String beg = sc.next(), end = sc.next(); int n = sc.nextInt();\n        Set<String> dict = new HashSet<>(); for (int i=0;i<n;i++) dict.add(sc.next());\n        Queue<String> q = new LinkedList<>(); q.offer(beg); int lvl = 0;\n        while (!q.isEmpty()) {\n            String cur = q.poll(); lvl++; if (cur.equals(end)) { System.out.println(lvl); return; }\n            char[] ch = cur.toCharArray();\n            for (int i=0;i<ch.length;i++){ char o=ch[i]; for(char c=\'a\';c<=\'z\';c++){ ch[i]=c; String nx=new String(ch); if(dict.contains(nx)) q.offer(nx); } ch[i]=o; }\n        }\n        System.out.println(0);`,
    `        String beg = sc.next(), end = sc.next(); int n = sc.nextInt();\n        Set<String> dict = new HashSet<>(); for (int i=0;i<n;i++) dict.add(sc.next());\n        if (!dict.contains(end)) { System.out.println(0); return; }\n        Queue<String> q = new LinkedList<>(); q.offer(beg); int lvl = 1;\n        while (!q.isEmpty()) {\n            int sz = q.size();\n            while (sz-- > 0) {\n                String cur = q.poll(); if (cur.equals(end)) { System.out.println(lvl); return; }\n                char[] ch = cur.toCharArray();\n                for (int i=0;i<ch.length;i++){ char o=ch[i]; for(char c=\'a\';c<=\'z\';c++){ ch[i]=c; String nx=new String(ch); if(dict.remove(nx)) q.offer(nx); } ch[i]=o; }\n            }\n            lvl++;\n        }\n        System.out.println(0);`,
    [{ input: 'hit cog 6\nhot dot dog lot log cog', expectedOutput: '5', description: '5 words' }, { input: 'hit cog 2\nhot dot', expectedOutput: '0', description: 'Unreachable' }]),

  javaBug('bh-java-m10-03', 'medium', 600, 'Fix Surrounded Regions Safe Mark',
    'Goal: r c then X/O matrix. O not connected to border becomes X. Count remaining safe O cells. Symptom: Floods ONLY top row & corrupts safe check.',
    `        int r = sc.nextInt(), c = sc.nextInt(); char[][] g = new char[r][c];\n        for (int i=0;i<r;i++){ String row=sc.next(); for (int j=0;j<c;j++) g[i][j]=row.charAt(j); }\n        Queue<int[]> q = new LinkedList<>();\n        for (int j=0;j<c;j++) if (g[0][j]==\'O\') q.offer(new int[]{0, j});\n        int[] dx={1,-1,0,0}, dy={0,0,1,-1}; int safe = 0;\n        while (!q.isEmpty()) { int[] cur=q.poll(); safe++; for(int d=0;d<4;d++){int nx=cur[0]+dx[d],ny=cur[1]+dy[d];if(nx>=0&&nx<r&&ny>=0&&ny<c&&g[nx][ny]==\'O\') q.offer(new int[]{nx,ny});} }\n        System.out.println(safe);`,
    `        int r = sc.nextInt(), c = sc.nextInt(); char[][] g = new char[r][c];\n        for (int i=0;i<r;i++){ String row=sc.next(); for (int j=0;j<c;j++) g[i][j]=row.charAt(j); }\n        Queue<int[]> q = new LinkedList<>();\n        for (int i=0;i<r;i++) for (int j=0;j<c;j++) if ((i==0||j==0||i==r-1||j==c-1)&&g[i][j]==\'O\') { g[i][j]=\'S\'; q.offer(new int[]{i,j}); }\n        int[] dx={1,-1,0,0}, dy={0,0,1,-1}; int safe = 0;\n        while (!q.isEmpty()) { int[] cur=q.poll(); safe++; for(int d=0;d<4;d++){int nx=cur[0]+dx[d],ny=cur[1]+dy[d];if(nx>=0&&nx<r&&ny>=0&&ny<c&&g[nx][ny]==\'O\'){g[nx][ny]=\'S\'; q.offer(new int[]{nx,ny});}} }\n        System.out.println(safe);`,
    [{ input: '4 4\nXXXX\nXOOX\nXXOX\nXOXX', expectedOutput: '1', description: 'Bottom border O only' }, { input: '3 3\nOOO\nOXO\nOOO', expectedOutput: '8', description: 'All 8 border Os' }]),

  javaBug('bh-java-m10-04', 'medium', 600, 'Fix Target Plus Minus Subset Bug',
    'Goal: T, n then non-negative ints. Count +/- assignments summing to T. Symptom: Loops forward & misses parity/bound guard on T+sum.',
    `        int T = sc.nextInt(), n = sc.nextInt(); int[] a = new int[n]; int tot=0; for(int i=0;i<n;i++){a[i]=sc.nextInt();tot+=a[i];}\n        int sub = (tot + T) / 2; int[] dp = new int[sub + 1]; dp[0]=1;\n        for (int x : a) for (int s=x;s<=sub;s++) dp[s] += dp[s-x];\n        System.out.println(dp[sub]);`,
    `        int T = sc.nextInt(), n = sc.nextInt(); int[] a = new int[n]; int tot=0; for(int i=0;i<n;i++){a[i]=sc.nextInt();tot+=a[i];}\n        if (Math.abs(T) > tot || (tot + T) % 2 != 0) { System.out.println(0); return; }\n        int sub = (tot + T) / 2; int[] dp = new int[sub + 1]; dp[0]=1;\n        for (int x : a) for (int s=sub;s>=x;s--) dp[s] += dp[s-x];\n        System.out.println(dp[sub]);`,
    [{ input: '3 5\n1 1 1 1 1', expectedOutput: '5', description: '5 combinations' }, { input: '2 2\n1 2', expectedOutput: '0', description: 'Parity odd -> 0' }]),

  javaBug('bh-java-m10-05', 'medium', 600, 'Fix Minimum Effort Priority Heap',
    'Goal: r c heights grid. Min path effort (max |adj diff|) (0,0)->(r-1,c-1). Symptom: Accumulates sum of diffs instead of max(edge) & omits visited guard.',
    `        int r = sc.nextInt(), c = sc.nextInt(); int[][] h = new int[r][c]; for(int i=0;i<r;i++) for(int j=0;j<c;j++) h[i][j]=sc.nextInt();\n        int[][] d = new int[r][c]; for(int[] row:d) Arrays.fill(row, Integer.MAX_VALUE); d[0][0]=0;\n        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a->a[0])); pq.offer(new int[]{0,0,0});\n        int[] dx={1,-1,0,0}, dy={0,0,1,-1};\n        while(!pq.isEmpty()){ int[] u=pq.poll(); if(u[1]==r-1&&u[2]==c-1){System.out.println(u[0]);return;} for(int k=0;k<4;k++){int nx=u[1]+dx[k],ny=u[2]+dy[k];if(nx>=0&&nx<r&&ny>=0&&ny<c){int nc=u[0]+Math.abs(h[nx][ny]-h[u[1]][u[2]]); if(nc<d[nx][ny]){d[nx][ny]=nc;pq.offer(new int[]{nc,nx,ny});}}} }`,
    `        int r = sc.nextInt(), c = sc.nextInt(); int[][] h = new int[r][c]; for(int i=0;i<r;i++) for(int j=0;j<c;j++) h[i][j]=sc.nextInt();\n        int[][] d = new int[r][c]; for(int[] row:d) Arrays.fill(row, Integer.MAX_VALUE); d[0][0]=0;\n        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a->a[0])); pq.offer(new int[]{0,0,0});\n        int[] dx={1,-1,0,0}, dy={0,0,1,-1};\n        while(!pq.isEmpty()){ int[] u=pq.poll(); if(u[0]>d[u[1]][u[2]]) continue; if(u[1]==r-1&&u[2]==c-1){System.out.println(u[0]);return;} for(int k=0;k<4;k++){int nx=u[1]+dx[k],ny=u[2]+dy[k];if(nx>=0&&nx<r&&ny>=0&&ny<c){int nc=Math.max(u[0],Math.abs(h[nx][ny]-h[u[1]][u[2]])); if(nc<d[nx][ny]){d[nx][ny]=nc;pq.offer(new int[]{nc,nx,ny});}}} }`,
    [{ input: '3 3\n1 2 2\n3 8 2\n5 3 5', expectedOutput: '2', description: 'Max step effort 2' }, { input: '2 2\n1 10\n2 4', expectedOutput: '2', description: '1->2->4 diff 2' }]),

  javaBug('bh-java-m10-06', 'medium', 600, 'Fix Closed Islands Interior Only',
    'Goal: r c then 0(land)/1(water) grid. Count land islands NOT touching grid borders. Symptom: Marks land as 0 instead of 1 & counts border islands too.',
    `        int r=sc.nextInt(), c=sc.nextInt(); int[][] g=new int[r][c]; for(int i=0;i<r;i++) for(int j=0;j<c;j++) g[i][j]=sc.nextInt();\n        int ans=0; int[] dx={1,-1,0,0}, dy={0,0,1,-1}; Queue<int[]> q=new LinkedList<>();\n        for(int i=0;i<r;i++) for(int j=0;j<c;j++) if(g[i][j]==0){ ans++; g[i][j]=1; q.offer(new int[]{i,j}); while(!q.isEmpty()){int[] cur=q.poll(); for(int d=0;d<4;d++){int nx=cur[0]+dx[d],ny=cur[1]+dy[d];if(nx>=0&&nx<r&&ny>=0&&ny<c&&g[nx][ny]==0){g[nx][ny]=1;q.offer(new int[]{nx,ny});}}} }\n        System.out.println(ans);`,
    `        int r=sc.nextInt(), c=sc.nextInt(); int[][] g=new int[r][c]; for(int i=0;i<r;i++) for(int j=0;j<c;j++) g[i][j]=sc.nextInt();\n        int[] dx={1,-1,0,0}, dy={0,0,1,-1}; Queue<int[]> q=new LinkedList<>();\n        for(int i=0;i<r;i++) for(int j=0;j<c;j++) if((i==0||j==0||i==r-1||j==c-1)&&g[i][j]==0){ g[i][j]=1; q.offer(new int[]{i,j}); }\n        while(!q.isEmpty()){int[] cur=q.poll(); for(int d=0;d<4;d++){int nx=cur[0]+dx[d],ny=cur[1]+dy[d];if(nx>=0&&nx<r&&ny>=0&&ny<c&&g[nx][ny]==0){g[nx][ny]=1;q.offer(new int[]{nx,ny});}}}\n        int ans=0; for(int i=0;i<r;i++) for(int j=0;j<c;j++) if(g[i][j]==0){ ans++; g[i][j]=1; q.offer(new int[]{i,j}); while(!q.isEmpty()){int[] cur=q.poll(); for(int d=0;d<4;d++){int nx=cur[0]+dx[d],ny=cur[1]+dy[d];if(nx>=0&&nx<r&&ny>=0&&ny<c&&g[nx][ny]==0){g[nx][ny]=1;q.offer(new int[]{nx,ny});}}} }\n        System.out.println(ans);`,
    [{ input: '5 5\n1 1 1 1 1\n1 0 1 0 1\n1 1 1 1 1\n1 0 0 0 1\n1 1 1 1 1', expectedOutput: '3', description: '3 closed' }, { input: '3 3\n0 1 1\n1 0 1\n1 1 1', expectedOutput: '1', description: 'Top-left corner excluded' }]),

  javaBug('bh-java-m10-07', 'medium', 600, 'Fix Zero-Jump Graph Cycle Visited',
    'Goal: start S, n then jump distances arr[i] (left or right). Print YES if index with val 0 reachable else NO. Symptom: Never tracks visited causing infinite oscillation.',
    `        int S=sc.nextInt(), n=sc.nextInt(); int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=sc.nextInt();\n        Queue<Integer> q=new LinkedList<>(); q.offer(S);\n        while(!q.isEmpty()){ int i=q.poll(); if(a[i]==0){System.out.println("YES");return;} if(i+a[i]<n) q.offer(i+a[i]); if(i-a[i]>=0) q.offer(i-a[i]); }\n        System.out.println("NO");`,
    `        int S=sc.nextInt(), n=sc.nextInt(); int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=sc.nextInt();\n        boolean[] vis=new boolean[n]; Queue<Integer> q=new LinkedList<>(); q.offer(S); vis[S]=true;\n        while(!q.isEmpty()){ int i=q.poll(); if(a[i]==0){System.out.println("YES");return;} for(int nx:new int[]{i+a[i], i-a[i]}) if(nx>=0&&nx<n&&!vis[nx]){vis[nx]=true;q.offer(nx);} }\n        System.out.println("NO");`,
    [{ input: '2 5\n3 0 2 1 2', expectedOutput: 'NO', description: 'Cycle must terminate NO' }, { input: '5 7\n4 2 3 0 3 1 2', expectedOutput: 'YES', description: 'Reaches 0' }]),

  javaBug('bh-java-m10-08', 'medium', 600, 'Fix Minimum Falling Path Columns',
    'Goal: n then n x n matrix. Min falling sum top row to bottom row (col +/- 1). Symptom: Only checks straight above & picks row 0 at end.',
    `        int n=sc.nextInt(); int[][] g=new int[n][n]; for(int i=0;i<n;i++) for(int j=0;j<n;j++) g[i][j]=sc.nextInt();\n        for(int i=1;i<n;i++) for(int j=0;j<n;j++) g[i][j] += Math.min(g[i-1][j], j+1<n?g[i-1][j+1]:Integer.MAX_VALUE);\n        System.out.println(g[0][0]);`,
    `        int n=sc.nextInt(); int[][] g=new int[n][n]; for(int i=0;i<n;i++) for(int j=0;j<n;j++) g[i][j]=sc.nextInt();\n        for(int i=1;i<n;i++) for(int j=0;j<n;j++){ int b=g[i-1][j]; if(j>0)b=Math.min(b,g[i-1][j-1]); if(j+1<n)b=Math.min(b,g[i-1][j+1]); g[i][j]+=b; }\n        int ans=g[n-1][0]; for(int j=1;j<n;j++) ans=Math.min(ans,g[n-1][j]); System.out.println(ans);`,
    [{ input: '3\n2 1 3\n6 5 4\n7 8 9', expectedOutput: '13', description: 'Diag left 1+5+7 or 1+4+8 = 13' }, { input: '2\n10 -5\n-20 50', expectedOutput: '-25', description: 'Diag left -5 + -20 = -25' }]),

  javaBug('bh-java-m10-09', 'medium', 600, 'Fix Longest Palindromic Subseq Diag',
    'Goal: Word s. Longest palindromic subsequence length. Symptom: Loops i ascending causing uncomputed dp[i+1] reads!',
    `        String s = sc.next(); int n = s.length(); int[][] dp = new int[n][n];\n        for (int i=0;i<n;i++) {\n            dp[i][i] = 1;\n            for (int j=i+1;j<n;j++) dp[i][j] = (s.charAt(i)==s.charAt(j)) ? dp[i+1][j-1]+1 : Math.max(dp[i+1][j], dp[i][j-1]);\n        }\n        System.out.println(dp[0][n-1]);`,
    `        String s = sc.next(); int n = s.length(); int[][] dp = new int[n][n];\n        for (int i=n-1;i>=0;i--) {\n            dp[i][i] = 1;\n            for (int j=i+1;j<n;j++) dp[i][j] = (s.charAt(i)==s.charAt(j)) ? dp[i+1][j-1]+2 : Math.max(dp[i+1][j], dp[i][j-1]);\n        }\n        System.out.println(dp[0][n-1]);`,
    [{ input: 'bbbab', expectedOutput: '4', description: 'bbbb = 4' }, { input: 'cbbd', expectedOutput: '2', description: 'bb = 2' }]),

  javaBug('bh-java-m10-10', 'medium', 600, 'Fix Collinear Points Vertical Slope Bug',
    'Goal: n then n points "x y". Max collinear points on one line. Symptom: Ignores vertical line div-by-zero & misses negative slope canonical sign.',
    `        int n = sc.nextInt(); int[][] pt = new int[n][2]; for(int i=0;i<n;i++){pt[i][0]=sc.nextInt();pt[i][1]=sc.nextInt();}\n        if (n<=2){System.out.println(n);return;} int best=1;\n        for (int i=0;i<n;i++){ Map<Double,Integer> mp=new HashMap<>(); for(int j=i+1;j<n;j++){ double sl=(double)(pt[j][1]-pt[i][1])/(pt[j][0]-pt[i][0]); mp.put(sl, mp.getOrDefault(sl,0)+1); best=Math.max(best, mp.get(sl)+1); } }\n        System.out.println(best);`,
    `        int n = sc.nextInt(); int[][] pt = new int[n][2]; for(int i=0;i<n;i++){pt[i][0]=sc.nextInt();pt[i][1]=sc.nextInt();}\n        if (n<=2){System.out.println(n);return;} int best=1;\n        for (int i=0;i<n;i++){ Map<String,Integer> mp=new HashMap<>(); for(int j=i+1;j<n;j++){ int dx=pt[j][0]-pt[i][0], dy=pt[j][1]-pt[i][1]; int g=java.math.BigInteger.valueOf(dx).gcd(java.math.BigInteger.valueOf(dy)).intValue(); dx/=g; dy/=g; if(dx<0||(dx==0&&dy<0)){dx=-dx;dy=-dy;} String key=dx+","+dy; mp.put(key, mp.getOrDefault(key,0)+1); best=Math.max(best, mp.get(key)+1); } }\n        System.out.println(best);`,
    [{ input: '4\n2 1\n2 5\n2 -3\n4 4', expectedOutput: '3', description: 'Vertical x=2 + signed zero float trap' }, { input: '6\n1 1\n3 2\n5 3\n4 1\n2 3\n1 4', expectedOutput: '4', description: '4 collinear' }]),
];

// ---------- HARD (4-5 subtle tricky bugs, 3m/5m/10m x 10 = 30) ----------
const JAVA_BUG_HARD = [
  // Hard 3m (10)
  javaBug('bh-java-h3-01', 'hard', 180, 'Fix Unique Window Sum Missing Shrink',
    'Goal: k, n then ints. Max sum of contiguous len-k window with ALL k unique (0 if none). Symptom: Never checks map.size()==k & miscalculates window evict.',
    `        int k=sc.nextInt(), n=sc.nextInt(); int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=sc.nextInt();\n        Map<Integer,Integer> mp=new HashMap<>(); int sum=0, best=0;\n        for (int i=0;i<n;i++){ sum+=a[i]; mp.put(a[i], mp.getOrDefault(a[i],0)+1); if (i>=k){ sum-=a[i-k]; mp.remove(a[i-k]); } if (i>=k-1) best=Math.max(best,sum); }\n        System.out.println(best);`,
    `        int k=sc.nextInt(), n=sc.nextInt(); int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=sc.nextInt();\n        Map<Integer,Integer> mp=new HashMap<>(); long sum=0, best=0;\n        for (int i=0;i<n;i++){ sum+=a[i]; mp.put(a[i], mp.getOrDefault(a[i],0)+1); if (i>=k){ sum-=a[i-k]; int c=mp.get(a[i-k])-1; if(c==0) mp.remove(a[i-k]); else mp.put(a[i-k],c); } if (i>=k-1 && mp.size()==k) best=Math.max(best,sum); }\n        System.out.println(best);`,
    [{ input: '3 7\n1 5 4 2 9 9 9', expectedOutput: '15', description: '[4,2,9]=15, [9,9,9] rejected' }, { input: '3 5\n5 5 1 5 2', expectedOutput: '8', description: 'Duplicate 5 removal preserves remaining count' }]),

  javaBug('bh-java-h3-02', 'hard', 180, 'Fix Smallest Repunit Modulo Overflow',
    'Goal: Integer k. Smallest repunit 111..1 length divisible by k, or -1. Symptom: Accumulates overflowing long 11111... instead of modular arithmetic.',
    `        int k = sc.nextInt(); if (k % 2 == 0) { System.out.println(-1); return; }\n        long val = 0; for (int len=1;len<=100;len++){ val = val * 10 + 1; if (val % k == 0){System.out.println(len);return;} }\n        System.out.println(-1);`,
    `        int k = sc.nextInt(); if (k % 2 == 0 || k % 5 == 0) { System.out.println(-1); return; }\n        int rem = 0; for (int len=1;len<=k;len++){ rem = (rem * 10 + 1) % k; if (rem == 0){System.out.println(len);return;} }\n        System.out.println(-1);`,
    [{ input: '23', expectedOutput: '22', description: 'Overflow fails long repunit without mod' }, { input: '5', expectedOutput: '-1', description: 'Divisible by 5 impossible' }]),

  javaBug('bh-java-h3-03', 'hard', 180, 'Fix Single Number III Bit Isolation',
    'Goal: n then ints where all appear twice except TWO. Print smaller then larger space-joined. Symptom: Splits using low bit precedence trap and reverses output order.',
    `        int n=sc.nextInt(); int[] a=new int[n]; int xr=0;\n        for (int i=0;i<n;i++){ a[i]=sc.nextInt(); xr^=a[i]; }\n        int bit = xr & (xr - 1); int x=0, y=0;\n        for (int v : a) if ((v & bit) == 1) x ^= v; else y ^= v;\n        System.out.println(x + " " + y);`,
    `        int n=sc.nextInt(); int[] a=new int[n]; int xr=0;\n        for (int i=0;i<n;i++){ a[i]=sc.nextInt(); xr^=a[i]; }\n        int bit = xr & (-xr); int x=0, y=0;\n        for (int v : a) if ((v & bit) != 0) x ^= v; else y ^= v;\n        System.out.println(Math.min(x, y) + " " + Math.max(x, y));`,
    [{ input: '6\n1 2 1 3 2 5', expectedOutput: '3 5', description: 'Bit mask isolation != 0 not == 1' }, { input: '4\n4 8 4 12', expectedOutput: '8 12', description: 'High bit split' }]),

  javaBug('bh-java-h3-04', 'hard', 180, 'Fix Median Two Sorted Bounds Sign',
    'Goal: n, n sorted ints A, m, m sorted ints B. Print (2 * true median) integer exact. Symptom: Wrong partition symmetry & divides odd case wrong.',
    `        int n=sc.nextInt(); int[] a=new int[n]; for(int i=0;i<n;i++)a[i]=sc.nextInt();\n        int m=sc.nextInt(); int[] b=new int[m]; for(int i=0;i<m;i++)b[i]=sc.nextInt();\n        int lo=0, hi=n;\n        while(lo<=hi){\n            int i=(lo+hi)/2, j=(n+m)/2 - i;\n            int al=i==0?0:a[i-1], ar=i==n?0:a[i], bl=j==0?0:b[j-1], br=j==m?0:b[j];\n            if(al<=br && bl<=ar){ System.out.println(Math.max(al,bl)+Math.min(ar,br)); return; }\n            if(al>br) hi=i-1; else lo=i+1;\n        }`,
    `        int n=sc.nextInt(); int[] a=new int[n]; for(int i=0;i<n;i++)a[i]=sc.nextInt();\n        int m=sc.nextInt(); int[] b=new int[m]; for(int i=0;i<m;i++)b[i]=sc.nextInt();\n        if(n>m){int[] t=a;a=b;b=t;int tn=n;n=m;m=tn;}\n        int lo=0, hi=n;\n        while(lo<=hi){\n            int i=(lo+hi)/2, j=(n+m+1)/2 - i;\n            int al=i==0?Integer.MIN_VALUE:a[i-1], ar=i==n?Integer.MAX_VALUE:a[i], bl=j==0?Integer.MIN_VALUE:b[j-1], br=j==m?Integer.MAX_VALUE:b[j];\n            if(al<=br && bl<=ar){ System.out.println((n+m)%2==1 ? Math.max(al,bl)*2L : (long)Math.max(al,bl)+Math.min(ar,br)); return; }\n            if(al>br) hi=i-1; else lo=i+1;\n        }`,
    [{ input: '3\n1 2 8\n2\n3 9', expectedOutput: '6', description: 'Sorted [1,2,3,8,9] med=3 -> 6' }, { input: '2\n1 2\n2\n3 4', expectedOutput: '5', description: '2+3 = 5' }]),

  javaBug('bh-java-h3-05', 'hard', 180, 'Fix Balanced Bracket Bit-Depth Score',
    'Goal: Valid parens ()=1, AB=A+B, (A)=2*A. Print total score. Symptom: Counts every ) even nested ones and skips << precedence.',
    `        String s = sc.next(); int bal=0, score=0;\n        for (int i=0;i<s.length();i++) {\n            if (s.charAt(i)==\'(\') bal++;\n            else { bal--; score += 1 << bal; }\n        }\n        System.out.println(score);`,
    `        String s = sc.next(); int bal=0, score=0;\n        for (int i=0;i<s.length();i++) {\n            if (s.charAt(i)==\'(\') bal++;\n            else { bal--; if (s.charAt(i-1)==\'(\') score += 1 << bal; }\n        }\n        System.out.println(score);`,
    [{ input: '(()(()))', expectedOutput: '6', description: 'Only leaf () pairs score' }, { input: '((()))', expectedOutput: '4', description: '4 not 4+2+1' }]),

  javaBug('bh-java-h3-06', 'hard', 180, 'Fix Egg Drop Moves Backward Loop',
    'Goal: k eggs, F floors. Min worst-case drops. Symptom: Updates egg count forward letting one drop split twice!',
    `        int k = sc.nextInt(), F = sc.nextInt(); int[] dp = new int[k + 1]; int m = 0;\n        while (dp[k] <= F) { m++; for (int e=1;e<=k;e++) dp[e] += dp[e - 1] + 1; }\n        System.out.println(m);`,
    `        int k = sc.nextInt(), F = sc.nextInt(); int[] dp = new int[k + 1]; int m = 0;\n        while (dp[k] < F) { m++; for (int e=k;e>=1;e--) dp[e] += dp[e - 1] + 1; }\n        System.out.println(m);`,
    [{ input: '2 6', expectedOutput: '3', description: 'Exactly 6 floors fits 3 moves' }, { input: '3 14', expectedOutput: '4', description: 'Exact DP recurrence' }]),

  javaBug('bh-java-h3-07', 'hard', 180, 'Fix Longest Zero-Sum Slice Offset',
    'Goal: n then ints. Longest subarray with sum == 0. Symptom: Omits first.put(0,-1), uses int overflow, overwrites earlier occurrence.',
    `        int n = sc.nextInt(); Map<Integer,Integer> first = new HashMap<>(); int pref=0, best=0;\n        for (int i=0;i<n;i++){ pref+=sc.nextInt(); if (first.containsKey(pref)) best=Math.max(best, i - first.get(pref) + 1); first.put(pref, i); }\n        System.out.println(best);`,
    `        int n = sc.nextInt(); Map<Long,Integer> first = new HashMap<>(); first.put(0L, -1); long pref=0; int best=0;\n        for (int i=0;i<n;i++){ pref+=sc.nextLong(); if (first.containsKey(pref)) best=Math.max(best, i - first.get(pref)); else first.put(pref, i); }\n        System.out.println(best);`,
    [{ input: '4\n2 -2 5 -5', expectedOutput: '4', description: 'Starts at 0 -> whole 4' }, { input: '8\n15 -2 2 -8 1 7 10 23', expectedOutput: '5', description: 'Len 5' }]),

  javaBug('bh-java-h3-08', 'hard', 180, 'Fix Minimum Refuel MaxHeap Reverse',
    'Goal: Target T, startFuel F, n, then n "pos fuel". Min refuels or -1. Symptom: Uses default MIN heap & misses while loop over reachable stations.',
    `        int T=sc.nextInt(), F=sc.nextInt(), n=sc.nextInt(); int[][] st=new int[n][2]; for(int i=0;i<n;i++){st[i][0]=sc.nextInt();st[i][1]=sc.nextInt();}\n        PriorityQueue<Integer> pq = new PriorityQueue<>(); int fuel=F, i=0, stops=0;\n        while (fuel < T) { if (i<n && st[i][0]<=fuel) pq.offer(st[i++][1]); if (pq.isEmpty()){System.out.println(-1);return;} fuel+=pq.poll(); stops++; }\n        System.out.println(stops);`,
    `        int T=sc.nextInt(), F=sc.nextInt(), n=sc.nextInt(); int[][] st=new int[n][2]; for(int i=0;i<n;i++){st[i][0]=sc.nextInt();st[i][1]=sc.nextInt();}\n        PriorityQueue<Integer> pq = new PriorityQueue<>(Collections.reverseOrder()); int fuel=F, i=0, stops=0;\n        while (fuel < T) { while (i<n && st[i][0]<=fuel) pq.offer(st[i++][1]); if (pq.isEmpty()){System.out.println(-1);return;} fuel+=pq.poll(); stops++; }\n        System.out.println(stops);`,
    [{ input: '100 10 4\n10 60\n20 30\n30 30\n60 40', expectedOutput: '2', description: 'Needs max-heap' }, { input: '50 25 2\n10 10\n20 30', expectedOutput: '1', description: 'Must collect both reachable 10 & 30 then pick 30' }]),

  javaBug('bh-java-h3-09', 'hard', 180, 'Fix Split Subarray Search Bounds',
    'Goal: k splits, n positive ints. Minimize largest subarray sum. Symptom: Sets lo=0 violating single max item & decrements parts off-by-one.',
    `        int k=sc.nextInt(), n=sc.nextInt(); int[] a=new int[n]; long lo=0, hi=0; for(int i=0;i<n;i++){a[i]=sc.nextInt();hi+=a[i];}\n        while(lo<hi){ long m=(lo+hi)/2, cur=0; int parts=0; for(int x:a){if(cur+x>=m){parts++;cur=0;}cur+=x;} if(parts<k)hi=m; else lo=m+1; }\n        System.out.println(lo);`,
    `        int k=sc.nextInt(), n=sc.nextInt(); int[] a=new int[n]; long lo=0, hi=0; for(int i=0;i<n;i++){a[i]=sc.nextInt();lo=Math.max(lo,a[i]);hi+=a[i];}\n        while(lo<hi){ long m=lo+(hi-lo)/2, cur=0; int parts=1; for(int x:a){if(cur+x>m){parts++;cur=0;}cur+=x;} if(parts<=k)hi=m; else lo=m+1; }\n        System.out.println(lo);`,
    [{ input: '2 5\n7 2 5 10 8', expectedOutput: '18', description: '[7,2,5] & [10,8]' }, { input: '3 3\n1 4 4', expectedOutput: '4', description: 'Min max = 4' }]),

  javaBug('bh-java-h3-10', 'hard', 180, 'Fix Count Primes Square Sieve Overflow',
    'Goal: Integer n. Count primes strictly < n. Symptom: i*i overflows signed int for n >= 46349 & skips base n <= 2.',
    `        int n = sc.nextInt(); boolean[] comp = new boolean[n]; int ans = 0;\n        for (int i=2;i<n;i++) if (!comp[i]) { ans++; for (int j=i*i;j<n;j+=i) comp[j]=true; }\n        System.out.println(ans);`,
    `        int n = sc.nextInt(); if (n <= 2) { System.out.println(0); return; }\n        boolean[] comp = new boolean[n]; int ans = 0;\n        for (int i=2;i<n;i++) if (!comp[i]) { ans++; for (long j=(long)i*i;j<n;j+=i) comp[(int)j]=true; }\n        System.out.println(ans);`,
    [{ input: '50000', expectedOutput: '5133', description: 'Large sieve int overflow check' }, { input: '1', expectedOutput: '0', description: 'n=1 -> 0' }]),

  // Hard 5m (10)
  javaBug('bh-java-h5-01', 'hard', 300, 'Fix Dungeon HP Negative Clamp Trap',
    'Goal: r c matrix (pos heal, neg damage). Min initial HP staying >= 1 from top-left to bottom-right. Symptom: Runs forward losing path dependency & omits >= 1 clamp.',
    `        int r=sc.nextInt(), c=sc.nextInt(); int[][] g=new int[r][c]; for(int i=0;i<r;i++) for(int j=0;j<c;j++) g[i][j]=sc.nextInt();\n        int[][] dp=new int[r][c]; dp[0][0]=g[0][0];\n        for(int i=0;i<r;i++) for(int j=0;j<c;j++){ if(i>0||j>0) dp[i][j]=Math.max(i>0?dp[i-1][j]:-999999, j>0?dp[i][j-1]:-999999)+g[i][j]; }\n        System.out.println(1 - dp[r-1][c-1]);`,
    `        int r=sc.nextInt(), c=sc.nextInt(); int[][] g=new int[r][c]; for(int i=0;i<r;i++) for(int j=0;j<c;j++) g[i][j]=sc.nextInt();\n        int[][] dp=new int[r+1][c+1]; for(int[] row:dp) Arrays.fill(row, Integer.MAX_VALUE); dp[r][c-1]=1; dp[r-1][c]=1;\n        for(int i=r-1;i>=0;i--) for(int j=c-1;j>=0;j--) dp[i][j]=Math.max(1, Math.min(dp[i+1][j], dp[i][j+1]) - g[i][j]);\n        System.out.println(dp[0][0]);`,
    [{ input: '3 3\n-2 -3 3\n-5 -10 1\n10 30 -5', expectedOutput: '7', description: 'Reverse DP -> 7' }, { input: '1 2\n10 -2', expectedOutput: '1', description: 'Positive start cannot carry below min 1' }]),

  javaBug('bh-java-h5-02', 'hard', 300, 'Fix Histogram Area Missing Right Flush',
    'Goal: n then heights. Largest rectangle area. Symptom: Omits stack drain after loop & computes width off by +1.',
    `        int n=sc.nextInt(); int[] h=new int[n]; for(int i=0;i<n;i++) h[i]=sc.nextInt();\n        Deque<Integer> st=new ArrayDeque<>(); long best=0;\n        for(int i=0;i<n;i++){\n            while(!st.isEmpty() && h[st.peek()]>=h[i]){ long ht=h[st.pop()]; long w=st.isEmpty()?i+1:i-st.peek(); best=Math.max(best, ht*w); }\n            st.push(i);\n        }\n        System.out.println(best);`,
    `        int n=sc.nextInt(); int[] h=new int[n]; for(int i=0;i<n;i++) h[i]=sc.nextInt();\n        Deque<Integer> st=new ArrayDeque<>(); long best=0;\n        for(int i=0;i<=n;i++){\n            int cur = (i == n) ? 0 : h[i];\n            while(!st.isEmpty() && h[st.peek()]>cur){ long ht=h[st.pop()]; long w=st.isEmpty()?i:i-st.peek()-1; best=Math.max(best, ht*w); }\n            st.push(i);\n        }\n        System.out.println(best);`,
    [{ input: '6\n2 1 5 6 2 3', expectedOutput: '10', description: '5*2=10' }, { input: '3\n2 4 6', expectedOutput: '8', description: 'Monotone ends require trailing 0 flush' }]),

  javaBug('bh-java-h5-03', 'hard', 300, 'Fix Interleaving Bounds Carry Trap',
    'Goal: Strings s1, s2, s3. Print YES if s3 interleaves s1 and s2 else NO. Symptom: Resets dp[0] blindly and omits total length mismatch guard.',
    `        String s1=sc.next(), s2=sc.next(), s3=sc.next(); int m=s1.length(), n=s2.length();\n        boolean[] dp=new boolean[n+1]; dp[0]=true;\n        for(int i=1;i<=m;i++) for(int j=1;j<=n;j++)\n            dp[j]=(dp[j]&&s1.charAt(i-1)==s3.charAt(i+j-1))||(dp[j-1]&&s2.charAt(j-1)==s3.charAt(i+j-1));\n        System.out.println(dp[n] ? "YES" : "NO");`,
    `        String s1=sc.next(), s2=sc.next(), s3=sc.next(); int m=s1.length(), n=s2.length();\n        if(m+n!=s3.length()){System.out.println("NO");return;}\n        boolean[] dp=new boolean[n+1]; dp[0]=true;\n        for(int j=1;j<=n;j++) dp[j]=dp[j-1]&&s2.charAt(j-1)==s3.charAt(j-1);\n        for(int i=1;i<=m;i++){ dp[0]=dp[0]&&s1.charAt(i-1)==s3.charAt(i-1); for(int j=1;j<=n;j++) dp[j]=(dp[j]&&s1.charAt(i-1)==s3.charAt(i+j-1))||(dp[j-1]&&s2.charAt(j-1)==s3.charAt(i+j-1)); }\n        System.out.println(dp[n] ? "YES" : "NO");`,
    [{ input: 'b a ab', expectedOutput: 'YES', description: 'Must init row 0 for s2' }, { input: 'a b abc', expectedOutput: 'NO', description: 'Length mismatch -> NO' }]),

  javaBug('bh-java-h5-04', 'hard', 300, 'Fix FreqStack Tie Break Group Pop',
    'Goal: q ops ("PUSH x" or "POP"). POP removes & prints most frequent (tie -> top). Symptom: Uses single maxHeap losing LIFO tiebreak & never updates freq.',
    `        int q=sc.nextInt(); Map<Integer,Integer> f=new HashMap<>(); int seq=0;\n        PriorityQueue<int[]> pq=new PriorityQueue<>((a,b)->a[0]!=b[0]?b[0]-a[0]:a[1]-b[1]);\n        StringBuilder sb=new StringBuilder();\n        while(q-->0){ String op=sc.next(); if(op.equals("PUSH")){int x=sc.nextInt();f.put(x,f.getOrDefault(x,0)+1);pq.offer(new int[]{f.get(x),++seq,x});} else{ int[] t=pq.poll(); if(sb.length()>0)sb.append(" "); sb.append(t[2]); } }\n        System.out.println(sb.toString());`,
    `        int q=sc.nextInt(); Map<Integer,Integer> f=new HashMap<>(); Map<Integer,Deque<Integer>> g=new HashMap<>(); int maxF=0;\n        StringBuilder sb=new StringBuilder();\n        while(q-->0){ String op=sc.next(); if(op.equals("PUSH")){int x=sc.nextInt();int nv=f.getOrDefault(x,0)+1;f.put(x,nv);maxF=Math.max(maxF,nv);g.computeIfAbsent(nv,z->new ArrayDeque<>()).push(x);} else{ int x=g.get(maxF).pop(); f.put(x,maxF-1); if(g.get(maxF).isEmpty())maxF--; if(sb.length()>0)sb.append(" "); sb.append(x); } }\n        System.out.println(sb.toString());`,
    [{ input: '10\nPUSH 5\nPUSH 7\nPUSH 5\nPUSH 7\nPUSH 4\nPUSH 5\nPOP\nPOP\nPOP\nPOP', expectedOutput: '5 7 5 4', description: '5, 7, 5, 4' }, { input: '4\nPUSH 1\nPUSH 2\nPOP\nPOP', expectedOutput: '2 1', description: 'Most recent 2 first' }]),

  javaBug('bh-java-h5-05', 'hard', 300, 'Fix Wildcard Glob Star Init Trap',
    'Goal: word s, pattern p (?=1, *=0+). Print YES if match else NO. Symptom: Never initializes dp[0][j] for leading * and inverted * DP transition.',
    `        String s=sc.next(), p=sc.next(); int m=s.length(), n=p.length();\n        boolean[][] dp=new boolean[m+1][n+1]; dp[0][0]=true;\n        for(int i=1;i<=m;i++) for(int j=1;j<=n;j++){\n            if(p.charAt(j-1)==\'*\') dp[i][j]=dp[i][j-1];\n            else if(p.charAt(j-1)==\'?\'||s.charAt(i-1)==p.charAt(j-1)) dp[i][j]=dp[i-1][j-1];\n        }\n        System.out.println(dp[m][n] ? "YES" : "NO");`,
    `        String s=sc.next(), p=sc.next(); int m=s.length(), n=p.length();\n        boolean[][] dp=new boolean[m+1][n+1]; dp[0][0]=true;\n        for(int j=1;j<=n;j++) if(p.charAt(j-1)==\'*\') dp[0][j]=dp[0][j-1];\n        for(int i=1;i<=m;i++) for(int j=1;j<=n;j++){\n            if(p.charAt(j-1)==\'*\') dp[i][j]=dp[i-1][j] || dp[i][j-1];\n            else if(p.charAt(j-1)==\'?\'||s.charAt(i-1)==p.charAt(j-1)) dp[i][j]=dp[i-1][j-1];\n        }\n        System.out.println(dp[m][n] ? "YES" : "NO");`,
    [{ input: 'adceb *a*b', expectedOutput: 'YES', description: 'Leading * matches empty & dce' }, { input: 'aa *', expectedOutput: 'YES', description: '* absorbs multiple' }]),

  javaBug('bh-java-h5-06', 'hard', 300, 'Fix Basic Calculator Sign Nesting',
    'Goal: Line expression with digits, +, -, (, ), spaces. Evaluate int. Symptom: Discards sign on ) pop order and ignores final trailing number.',
    `        String s = ""; while(sc.hasNextLine()){String ln=sc.nextLine().trim(); if(!ln.isEmpty()){s=ln;break;}}\n        Deque<Integer> st=new ArrayDeque<>(); int res=0, num=0, sign=1;\n        for(char c:s.toCharArray()){\n            if(Character.isDigit(c)) num=num*10+(c-\'0\');\n            else if(c==\'+\'){res+=sign*num;num=0;sign=1;}\n            else if(c==\'-\'){res+=sign*num;num=0;sign=-1;}\n            else if(c==\'(\'){st.push(res);st.push(sign);res=0;}\n            else if(c==\')\'){res+=sign*num;num=0;res+=st.pop();res*=st.pop();}\n        }\n        System.out.println(res);`,
    `        String s = ""; while(sc.hasNextLine()){String ln=sc.nextLine().trim(); if(!ln.isEmpty()){s=ln;break;}}\n        Deque<Integer> st=new ArrayDeque<>(); int res=0, num=0, sign=1;\n        for(char c:s.toCharArray()){\n            if(Character.isDigit(c)) num=num*10+(c-\'0\');\n            else if(c==\'+\'){res+=sign*num;num=0;sign=1;}\n            else if(c==\'-\'){res+=sign*num;num=0;sign=-1;}\n            else if(c==\'(\'){st.push(res);st.push(sign);res=0;sign=1;}\n            else if(c==\')\'){res+=sign*num;num=0;res*=st.pop();res+=st.pop();}\n        }\n        System.out.println(res + sign * num);`,
    [{ input: '-(2 + 3) + 10', expectedOutput: '5', description: '-5 + 10 = 5' }, { input: '(1+(4+5+2)-3)+(6+8)', expectedOutput: '23', description: '23' }]),

  javaBug('bh-java-h5-07', 'hard', 300, 'Fix Alternate Color Edge Shortest BFS',
    'Goal: n nodes, re red edges, be blue edges. Shortest alt-color path 0->n-1 else -1. Symptom: Shares visited array across colors & skips n=1 case.',
    `        int n=sc.nextInt(), re=sc.nextInt(), be=sc.nextInt();\n        List<Integer>[][] adj=new List[2][n]; for(int t=0;t<2;t++) for(int i=0;i<n;i++) adj[t][i]=new ArrayList<>();\n        for(int i=0;i<re;i++) adj[0][sc.nextInt()].add(sc.nextInt());\n        for(int i=0;i<be;i++) adj[1][sc.nextInt()].add(sc.nextInt());\n        boolean[] vis=new boolean[n]; Queue<int[]> q=new LinkedList<>();\n        q.offer(new int[]{0,0,0}); q.offer(new int[]{0,1,0}); vis[0]=true;\n        while(!q.isEmpty()){ int[] cur=q.poll(); int nxC=cur[1]^1; for(int v:adj[nxC][cur[0]]){ if(v==n-1){System.out.println(cur[2]+1);return;} if(!vis[v]){vis[v]=true;q.offer(new int[]{v,nxC,cur[2]+1});} } }\n        System.out.println(-1);`,
    `        int n=sc.nextInt(), re=sc.nextInt(), be=sc.nextInt();\n        List<Integer>[][] adj=new List[2][n]; for(int t=0;t<2;t++) for(int i=0;i<n;i++) adj[t][i]=new ArrayList<>();\n        for(int i=0;i<re;i++) adj[0][sc.nextInt()].add(sc.nextInt());\n        for(int i=0;i<be;i++) adj[1][sc.nextInt()].add(sc.nextInt());\n        if (n == 1) { System.out.println(0); return; }\n        boolean[][] vis=new boolean[2][n]; Queue<int[]> q=new LinkedList<>();\n        q.offer(new int[]{0,0,0}); q.offer(new int[]{0,1,0}); vis[0][0]=vis[1][0]=true;\n        while(!q.isEmpty()){ int[] cur=q.poll(); int nxC=cur[1]^1; for(int v:adj[nxC][cur[0]]){ if(v==n-1){System.out.println(cur[2]+1);return;} if(!vis[nxC][v]){vis[nxC][v]=true;q.offer(new int[]{v,nxC,cur[2]+1});} } }\n        System.out.println(-1);`,
    [{ input: '3 1 2\n0 1\n0 1\n1 2', expectedOutput: '2', description: 'Red 0->1 then Blue 1->2 requires color-tagged visited' }, { input: '3 1 1\n0 1\n0 1', expectedOutput: '-1', description: 'Unreachable 2' }]),

  javaBug('bh-java-h5-08', 'hard', 300, 'Fix Swim Rising Grid Dijkstra Update',
    'Goal: n x n elevation grid. Move 4-dir waiting until t >= elevation. Min time (0,0)->(n-1,n-1). Symptom: Uses BFS ignoring heap order and misses max(cur, elev).',
    `        int n=sc.nextInt(); int[][] g=new int[n][n]; for(int i=0;i<n;i++) for(int j=0;j<n;j++) g[i][j]=sc.nextInt();\n        boolean[][] vis=new boolean[n][n]; Queue<int[]> pq=new LinkedList<>(); pq.offer(new int[]{g[0][0],0,0}); vis[0][0]=true;\n        int[] dx={1,-1,0,0}, dy={0,0,1,-1};\n        while(!pq.isEmpty()){ int[] c=pq.poll(); if(c[1]==n-1&&c[2]==n-1){System.out.println(c[0]);return;} for(int d=0;d<4;d++){int nx=c[1]+dx[d],ny=c[2]+dy[d];if(nx>=0&&nx<n&&ny>=0&&ny<c[2]+100&&ny<n&&!vis[nx][ny]){vis[nx][ny]=true;pq.offer(new int[]{g[nx][ny],nx,ny});}} }`,
    `        int n=sc.nextInt(); int[][] g=new int[n][n]; for(int i=0;i<n;i++) for(int j=0;j<n;j++) g[i][j]=sc.nextInt();\n        boolean[][] vis=new boolean[n][n]; PriorityQueue<int[]> pq=new PriorityQueue<>(Comparator.comparingInt(a->a[0])); pq.offer(new int[]{g[0][0],0,0}); vis[0][0]=true;\n        int[] dx={1,-1,0,0}, dy={0,0,1,-1};\n        while(!pq.isEmpty()){ int[] c=pq.poll(); if(c[1]==n-1&&c[2]==n-1){System.out.println(c[0]);return;} for(int d=0;d<4;d++){int nx=c[1]+dx[d],ny=c[2]+dy[d];if(nx>=0&&nx<n&&ny>=0&&ny<n&&!vis[nx][ny]){vis[nx][ny]=true;pq.offer(new int[]{Math.max(c[0], g[nx][ny]),nx,ny});}} }`,
    [{ input: '3\n0 2 3\n10 10 9\n10 10 1', expectedOutput: '9', description: 'Minimax path bottleneck is 9 > target cell 1' }, { input: '2\n0 2\n1 3', expectedOutput: '3', description: 'Max 3' }]),

  javaBug('bh-java-h5-09', 'hard', 300, 'Fix Kosaraju Graph Reverse SCC Count',
    'Goal: n nodes, e directed edges. Count Strongly Connected Components. Symptom: Iterates finishing order forward instead of reverse & leaves vis true.',
    `        int n=sc.nextInt(), e=sc.nextInt(); List<List<Integer>> g=new ArrayList<>(), rg=new ArrayList<>();\n        for(int i=0;i<n;i++){g.add(new ArrayList<>());rg.add(new ArrayList<>());}\n        for(int i=0;i<e;i++){int u=sc.nextInt(),v=sc.nextInt();g.get(u).add(v);rg.get(v).add(u);}\n        boolean[] vis=new boolean[n]; List<Integer> ord=new ArrayList<>();\n        class D{void d1(int u){vis[u]=true;for(int v:g.get(u))if(!vis[v])d1(v);ord.add(u);}void d2(int u){vis[u]=true;for(int v:rg.get(u))if(!vis[v])d2(v);}}\n        D d=new D(); for(int i=0;i<n;i++) if(!vis[i]) d.d1(i);\n        int scc=0; for(int i=0;i<n;i++) if(!vis[ord.get(i)]){scc++; d.d2(ord.get(i));}\n        System.out.println(scc);`,
    `        int n=sc.nextInt(), e=sc.nextInt(); List<List<Integer>> g=new ArrayList<>(), rg=new ArrayList<>();\n        for(int i=0;i<n;i++){g.add(new ArrayList<>());rg.add(new ArrayList<>());}\n        for(int i=0;i<e;i++){int u=sc.nextInt(),v=sc.nextInt();g.get(u).add(v);rg.get(v).add(u);}\n        boolean[] vis=new boolean[n]; List<Integer> ord=new ArrayList<>();\n        class D{void d1(int u){vis[u]=true;for(int v:g.get(u))if(!vis[v])d1(v);ord.add(u);}void d2(int u){vis[u]=true;for(int v:rg.get(u))if(!vis[v])d2(v);}}\n        D d=new D(); for(int i=0;i<n;i++) if(!vis[i]) d.d1(i);\n        Arrays.fill(vis, false); int scc=0; for(int i=n-1;i>=0;i--) if(!vis[ord.get(i)]){scc++; d.d2(ord.get(i));}\n        System.out.println(scc);`,
    [{ input: '5 5\n1 0\n0 2\n2 1\n0 3\n3 4', expectedOutput: '3', description: '3 SCCs' }, { input: '2 1\n0 1', expectedOutput: '2', description: 'DAG 2 nodes = 2 SCCs' }]),

  javaBug('bh-java-h5-10', 'hard', 300, 'Fix Word Break DP Long Accumulator',
    'Goal: s, k dict words, then k words. Count valid word break sentences. Symptom: Uses boolean OR overwriting count & omits base dp[0]=1.',
    `        String s=sc.next(); int k=sc.nextInt(); Set<String> dict=new HashSet<>(); for(int i=0;i<k;i++) dict.add(sc.next());\n        int m=s.length(); long[] dp=new long[m+1];\n        for(int i=1;i<=m;i++) for(int j=0;j<i;j++) if(dict.contains(s.substring(j,i))) dp[i]=1;\n        System.out.println(dp[m]);`,
    `        String s=sc.next(); int k=sc.nextInt(); Set<String> dict=new HashSet<>(); for(int i=0;i<k;i++) dict.add(sc.next());\n        int m=s.length(); long[] dp=new long[m+1]; dp[0]=1;\n        for(int i=1;i<=m;i++) for(int j=0;j<i;j++) if(dp[j]>0 && dict.contains(s.substring(j,i))) dp[i]+=dp[j];\n        System.out.println(dp[m]);`,
    [{ input: 'catsanddog 5\ncat cats and sand dog', expectedOutput: '2', description: '2 splits' }, { input: 'pineapplepenapple 5\napple pen applepen pine pineapple', expectedOutput: '3', description: '3 splits' }]),

  // Hard 10m (10)
  javaBug('bh-java-h10-01', 'hard', 600, 'Fix Scramble String Split Substrings',
    'Goal: Strings s1, s2 (<=20). Print YES if scramble else NO. Symptom: Swapped substring length args in cross-swap check & drops char freq prune.',
    `        String s1=sc.next(), s2=sc.next(); Map<String,Boolean> memo=new HashMap<>();\n        class Sc{ boolean ok(String a, String b){\n            if(a.equals(b)) return true; int n=a.length();\n            for(int i=1;i<n;i++) if((ok(a.substring(0,i),b.substring(0,i))&&ok(a.substring(i),b.substring(i)))||(ok(a.substring(0,i),b.substring(0,n-i))&&ok(a.substring(i),b.substring(n-i)))) return true;\n            return false;\n        }}\n        System.out.println(new Sc().ok(s1,s2) ? "YES" : "NO");`,
    `        String s1=sc.next(), s2=sc.next(); Map<String,Boolean> memo=new HashMap<>();\n        class Sc{ boolean ok(String a, String b){\n            if(a.equals(b)) return true; String key=a+"#"+b; if(memo.containsKey(key)) return memo.get(key);\n            int n=a.length(); int[] cnt=new int[26]; for(int i=0;i<n;i++){cnt[a.charAt(i)-\'a\']++;cnt[b.charAt(i)-\'a\']--;} for(int v:cnt) if(v!=0){memo.put(key,false);return false;}\n            for(int i=1;i<n;i++) if((ok(a.substring(0,i),b.substring(0,i))&&ok(a.substring(i),b.substring(i)))||(ok(a.substring(0,i),b.substring(n-i))&&ok(a.substring(i),b.substring(0,n-i)))){memo.put(key,true);return true;}\n            memo.put(key,false); return false;\n        }}\n        System.out.println(new Sc().ok(s1,s2) ? "YES" : "NO");`,
    [{ input: 'great eatgr', expectedOutput: 'YES', description: 'Cross swap scramble' }, { input: 'abcde caebd', expectedOutput: 'NO', description: 'Invalid scramble' }]),

  javaBug('bh-java-h10-02', 'hard', 600, 'Fix Trap Rain Water Left Right Pointer',
    'Goal: n then heights. Total rainwater trapped. Symptom: Subtracts from min side without updating lm/rm max first & double counts middle.',
    `        int n=sc.nextInt(); int[] h=new int[n]; for(int i=0;i<n;i++) h[i]=sc.nextInt();\n        int l=0, r=n-1, lm=0, rm=0; long ans=0;\n        while(l<=r){ if(h[l]>h[r]){ lm=Math.max(lm,h[l]); ans+=lm-h[l]; l++; } else { rm=Math.max(rm,h[r]); ans+=rm-h[r]; r--; } }\n        System.out.println(ans);`,
    `        int n=sc.nextInt(); int[] h=new int[n]; for(int i=0;i<n;i++) h[i]=sc.nextInt();\n        int l=0, r=n-1, lm=0, rm=0; long ans=0;\n        while(l<r){ if(h[l]<h[r]){ lm=Math.max(lm,h[l]); ans+=lm-h[l]; l++; } else { rm=Math.max(rm,h[r]); ans+=rm-h[r]; r--; } }\n        System.out.println(ans);`,
    [{ input: '12\n0 1 0 2 1 0 1 3 2 1 2 1', expectedOutput: '6', description: '6 water trapped' }, { input: '6\n4 2 0 3 2 5', expectedOutput: '9', description: '9 water trapped' }]),

  javaBug('bh-java-h10-03', 'hard', 600, 'Fix Maximal All-One Matrix Histogram',
    'Goal: r c then 0/1 matrix. Largest all-1 rectangle area. Symptom: Fails resetting histogram height when cell == 0 & drops flush iteration.',
    `        int r=sc.nextInt(), c=sc.nextInt(); int[][] g=new int[r][c]; for(int i=0;i<r;i++) for(int j=0;j<c;j++) g[i][j]=sc.nextInt();\n        int[] h=new int[c+1]; long best=0;\n        for(int i=0;i<r;i++){\n            for(int j=0;j<c;j++) h[j] += g[i][j];\n            Deque<Integer> st=new ArrayDeque<>();\n            for(int j=0;j<c;j++){ while(!st.isEmpty()&&h[st.peek()]>=h[j]){ long ht=h[st.pop()]; long w=st.isEmpty()?j+1:j-st.peek(); best=Math.max(best,ht*w); } st.push(j); }\n        }\n        System.out.println(best);`,
    `        int r=sc.nextInt(), c=sc.nextInt(); int[][] g=new int[r][c]; for(int i=0;i<r;i++) for(int j=0;j<c;j++) g[i][j]=sc.nextInt();\n        int[] h=new int[c+1]; long best=0;\n        for(int i=0;i<r;i++){\n            for(int j=0;j<c;j++) h[j] = (g[i][j]==1 ? h[j]+1 : 0);\n            Deque<Integer> st=new ArrayDeque<>();\n            for(int j=0;j<=c;j++){ while(!st.isEmpty()&&h[st.peek()]>h[j]){ long ht=h[st.pop()]; long w=st.isEmpty()?j:j-st.peek()-1; best=Math.max(best,ht*w); } st.push(j); }\n        }\n        System.out.println(best);`,
    [{ input: '4 5\n1 0 1 0 0\n1 0 1 1 1\n1 1 1 1 1\n1 0 0 1 0', expectedOutput: '6', description: 'Must reset height on 0' }, { input: '3 2\n1 1\n0 1\n1 1', expectedOutput: '3', description: 'Col 1 has height 3' }]),

  javaBug('bh-java-h10-04', 'hard', 600, 'Fix Edit Distance Empty Row Base',
    'Goal: Strings a and b. Print Levenshtein edit distance. Symptom: Drops row 0 base values & overwrites prev diagonal early.',
    `        String a=sc.next(), b=sc.next(); int m=a.length(), n=b.length(); int[] dp=new int[n+1];\n        for(int i=1;i<=m;i++) for(int j=1;j<=n;j++){\n            if(a.charAt(i-1)==b.charAt(j-1)) dp[j]=dp[j-1]; else dp[j]=1+Math.min(dp[j], dp[j-1]);\n        }\n        System.out.println(dp[n]);`,
    `        String a=sc.next(), b=sc.next(); int m=a.length(), n=b.length(); int[] dp=new int[n+1];\n        for(int j=0;j<=n;j++) dp[j]=j;\n        for(int i=1;i<=m;i++){ int prev=dp[0]; dp[0]=i; for(int j=1;j<=n;j++){ int tmp=dp[j]; if(a.charAt(i-1)==b.charAt(j-1)) dp[j]=prev; else dp[j]=1+Math.min(prev, Math.min(dp[j], dp[j-1])); prev=tmp; } }\n        System.out.println(dp[n]);`,
    [{ input: 'horse ros', expectedOutput: '3', description: '3 edits' }, { input: 'intention execution', expectedOutput: '5', description: '5 edits' }]),

  javaBug('bh-java-h10-05', 'hard', 600, 'Fix House Robber Circle Edge Single',
    'Goal: n then houses in circle. Max non-adjacent cash. Symptom: Robs linear array allowing index 0 & n-1 overlap and crashes on n=1.',
    `        int n=sc.nextInt(); int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=sc.nextInt();\n        class R{ long go(int l,int r){long p2=0,p1=0;for(int i=l;i<r;i++){long c=Math.max(p1,p2+a[i]);p2=p1;p1=c;}return p1;} }\n        R rob=new R(); System.out.println(Math.max(rob.go(0,n), rob.go(1,n)));`,
    `        int n=sc.nextInt(); int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=sc.nextInt();\n        if(n==1){System.out.println(a[0]);return;}\n        class R{ long go(int l,int r){long p2=0,p1=0;for(int i=l;i<=r;i++){long c=Math.max(p1,p2+a[i]);p2=p1;p1=c;}return p1;} }\n        R rob=new R(); System.out.println(Math.max(rob.go(0,n-2), rob.go(1,n-1)));`,
    [{ input: '3\n2 3 2', expectedOutput: '3', description: '3 not 4' }, { input: '1\n7', expectedOutput: '7', description: 'Single 7' }]),

  javaBug('bh-java-h10-06', 'hard', 600, 'Fix Merge K Sorted PriorityQueue Swap',
    'Goal: k lists, each prefixed by length len_i then ints. Print fully merged sorted sequence space-joined. Symptom: Pushes value-only losing list pointer or skips empty lists.',
    `        int k = sc.nextInt(); List<int[]> lists = new ArrayList<>();\n        for(int i=0;i<k;i++){ int l=sc.nextInt(); int[] arr=new int[l]; for(int j=0;j<l;j++) arr[j]=sc.nextInt(); lists.add(arr); }\n        PriorityQueue<int[]> pq = new PriorityQueue<>((a,b) -> b[0] - a[0]);\n        for(int i=0;i<k;i++) pq.offer(new int[]{lists.get(i)[0], i, 0});\n        StringBuilder sb = new StringBuilder();\n        while(!pq.isEmpty()){ int[] cur=pq.poll(); if(sb.length()>0) sb.append(" "); sb.append(cur[0]); if(cur[2]+1 < lists.get(cur[1]).length) pq.offer(new int[]{lists.get(cur[1])[cur[2]], cur[1], cur[2]+1}); }\n        System.out.println(sb.toString());`,
    `        int k = sc.nextInt(); List<int[]> lists = new ArrayList<>();\n        for(int i=0;i<k;i++){ int l=sc.nextInt(); int[] arr=new int[l]; for(int j=0;j<l;j++) arr[j]=sc.nextInt(); lists.add(arr); }\n        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));\n        for(int i=0;i<k;i++) if(lists.get(i).length>0) pq.offer(new int[]{lists.get(i)[0], i, 0});\n        StringBuilder sb = new StringBuilder();\n        while(!pq.isEmpty()){ int[] cur=pq.poll(); if(sb.length()>0) sb.append(" "); sb.append(cur[0]); if(cur[2]+1 < lists.get(cur[1]).length) pq.offer(new int[]{lists.get(cur[1])[cur[2]+1], cur[1], cur[2]+1}); }\n        System.out.println(sb.length()==0 ? "EMPTY" : sb.toString());`,
    [{ input: '3\n3 1 4 5\n0\n2 2 6', expectedOutput: '1 2 4 5 6', description: 'Handles empty list 0 & min-heap + index+1' }, { input: '2\n2 3 9\n2 1 4', expectedOutput: '1 3 4 9', description: 'Merged sorted' }]),

  javaBug('bh-java-h10-07', 'hard', 600, 'Fix Minimum Window Substring Cover Map',
    'Goal: strings s, t. Shortest substring len containing all chars of t (or 0). Symptom: Unboxed Integer equality == fails > 127 & shrinks l prematurely.',
    `        String s=sc.next(), t=sc.next(); Map<Character,Integer> need=new HashMap<>(); for(char c:t.toCharArray()) need.put(c, need.getOrDefault(c,0)+1);\n        int miss=t.length(), l=0, best=Integer.MAX_VALUE;\n        for(int r=0;r<s.length();r++){\n            char c=s.charAt(r); int cur=need.getOrDefault(c,0); if(cur>=0) miss--; need.put(c, cur-1);\n            while(miss==0){ best=Math.min(best, r-l); char lc=s.charAt(l++); need.put(lc, need.get(lc)+1); if(need.get(lc)>0) miss++; }\n        }\n        System.out.println(best == Integer.MAX_VALUE ? 0 : best);`,
    `        String s=sc.next(), t=sc.next(); Map<Character,Integer> need=new HashMap<>(); for(char c:t.toCharArray()) need.put(c, need.getOrDefault(c,0)+1);\n        int miss=t.length(), l=0, best=Integer.MAX_VALUE;\n        for(int r=0;r<s.length();r++){\n            char c=s.charAt(r); int cur=need.getOrDefault(c,0); if(cur>0) miss--; need.put(c, cur-1);\n            while(miss==0){ best=Math.min(best, r-l+1); char lc=s.charAt(l++); need.put(lc, need.get(lc)+1); if(need.get(lc)>0) miss++; }\n        }\n        System.out.println(best == Integer.MAX_VALUE ? 0 : best);`,
    [{ input: 'ADOBECODEBANC ABC', expectedOutput: '4', description: 'BANC -> 4' }, { input: 'aa aa', expectedOutput: '2', description: 'Multiplicity match' }]),

  javaBug('bh-java-h10-08', 'hard', 600, 'Fix Java Articulation Vertex Root Bug',
    'Goal: n nodes, e undirected edges. Count articulation vertices. Symptom: Marks root when ch >= 1 instead of > 1 & drops disconnected graphs.',
    `        int n=sc.nextInt(), e=sc.nextInt(); List<List<Integer>> adj=new ArrayList<>(); for(int i=0;i<n;i++) adj.add(new ArrayList<>());\n        for(int i=0;i<e;i++){int u=sc.nextInt(),v=sc.nextInt();adj.get(u).add(v);adj.get(v).add(u);}\n        int[] disc=new int[n], low=new int[n]; Arrays.fill(disc,-1); boolean[] cut=new boolean[n]; int[] t={0};\n        class D{void go(int u,int p){ disc[u]=low[u]=t[0]++; int ch=0; for(int v:adj.get(u)){ if(v==p)continue; if(disc[v]!=-1) low[u]=Math.min(low[u],low[v]); else{ch++;go(v,u);low[u]=Math.min(low[u],low[v]);if(low[v]>disc[u])cut[u]=true;} } if(p==-1&&ch>=1) cut[u]=true; }}\n        new D().go(0,-1); int cnt=0; for(boolean b:cut) if(b)cnt++; System.out.println(cnt);`,
    `        int n=sc.nextInt(), e=sc.nextInt(); List<List<Integer>> adj=new ArrayList<>(); for(int i=0;i<n;i++) adj.add(new ArrayList<>());\n        for(int i=0;i<e;i++){int u=sc.nextInt(),v=sc.nextInt();adj.get(u).add(v);adj.get(v).add(u);}\n        int[] disc=new int[n], low=new int[n]; Arrays.fill(disc,-1); boolean[] cut=new boolean[n]; int[] t={0};\n        class D{void go(int u,int p){ disc[u]=low[u]=t[0]++; int ch=0; for(int v:adj.get(u)){ if(v==p)continue; if(disc[v]!=-1) low[u]=Math.min(low[u],disc[v]); else{ch++;go(v,u);low[u]=Math.min(low[u],low[v]);if(p!=-1&&low[v]>=disc[u])cut[u]=true;} } if(p==-1&&ch>1) cut[u]=true; }}\n        D d=new D(); for(int i=0;i<n;i++) if(disc[i]==-1) d.go(i,-1); int cnt=0; for(boolean b:cut) if(b)cnt++; System.out.println(cnt);`,
    [{ input: '5 5\n1 0\n0 2\n2 1\n0 3\n3 4', expectedOutput: '2', description: 'Cuts: 0 and 3' }, { input: '3 3\n0 1\n1 2\n2 0', expectedOutput: '0', description: 'Root of cycle not cut' }]),

  javaBug('bh-java-h10-09', 'hard', 600, 'Fix Bounded K-Stops Flight Bellman Clone',
    'Goal: n, K, e, then e flights "u v cost". Min cost 0->n-1 in <= K stops else -1. Symptom: Chains multiple flights in same iteration without cloning array.',
    `        int n=sc.nextInt(), K=sc.nextInt(), e=sc.nextInt(); int[][] ed=new int[e][3]; for(int i=0;i<e;i++){ed[i][0]=sc.nextInt();ed[i][1]=sc.nextInt();ed[i][2]=sc.nextInt();}\n        long[] d=new long[n]; Arrays.fill(d, Long.MAX_VALUE/2); d[0]=0;\n        for(int k=0;k<K;k++) for(int[] f:ed) if(d[f[0]]+f[2] < d[f[1]]) d[f[1]]=d[f[0]]+f[2];\n        System.out.println(d[n-1] >= Long.MAX_VALUE/2 ? -1 : d[n-1]);`,
    `        int n=sc.nextInt(), K=sc.nextInt(), e=sc.nextInt(); int[][] ed=new int[e][3]; for(int i=0;i<e;i++){ed[i][0]=sc.nextInt();ed[i][1]=sc.nextInt();ed[i][2]=sc.nextInt();}\n        long INF = Long.MAX_VALUE / 4; long[] d=new long[n]; Arrays.fill(d, INF); d[0]=0;\n        for(int k=0;k<=K;k++){ long[] nd=d.clone(); for(int[] f:ed) if(d[f[0]]<INF && d[f[0]]+f[2] < nd[f[1]]) nd[f[1]]=d[f[0]]+f[2]; d=nd; }\n        System.out.println(d[n-1] >= INF ? -1 : d[n-1]);`,
    [{ input: '4 1 4\n0 1 100\n1 2 100\n2 3 100\n0 2 500', expectedOutput: '600', description: 'Prevents chaining > K+1 stops in one pass' }, { input: '3 1 2\n0 1 50\n1 2 50', expectedOutput: '100', description: '1 stop 0->1->2' }]),

  javaBug('bh-java-h10-10', 'hard', 600, 'Fix Knapsack Reverse Overflow Long Trap',
    'Goal: W, n items, weights[], values[]. Max value <= W. Symptom: Forward capacity reuses items & overflows int DP.',
    `        int W=sc.nextInt(), n=sc.nextInt(); int[] wt=new int[n], val=new int[n];\n        for(int i=0;i<n;i++) wt[i]=sc.nextInt(); for(int i=0;i<n;i++) val[i]=sc.nextInt();\n        int[] dp=new int[W];\n        for(int i=0;i<n;i++) for(int w=wt[i];w<W;w++) dp[w]=Math.max(dp[w], dp[w-wt[i]]+val[i]);\n        System.out.println(dp[W-1]);`,
    `        int W=sc.nextInt(), n=sc.nextInt(); int[] wt=new int[n], val=new int[n];\n        for(int i=0;i<n;i++) wt[i]=sc.nextInt(); for(int i=0;i<n;i++) val[i]=sc.nextInt();\n        long[] dp=new long[W+1];\n        for(int i=0;i<n;i++) for(int w=W;w>=wt[i];w--) dp[w]=Math.max(dp[w], dp[w-wt[i]]+val[i]);\n        System.out.println(dp[W]);`,
    [{ input: '5 3\n1 2 3\n10 15 40', expectedOutput: '55', description: '2+3 -> 55' }, { input: '6 2\n3 4\n20 25', expectedOutput: '25', description: 'No reuse of weight-3 twice -> 25 not 40' }]),
];

export const JAVA_BUG_QUESTIONS = [
  ...JAVA_BUG_EASY,
  ...JAVA_BUG_MED,
  ...JAVA_BUG_HARD,
];
