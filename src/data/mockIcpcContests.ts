import { IcpcContest } from '@/types/icpc';

export const CURATED_ICPC_CONTESTS: IcpcContest[] = [
  {
    id: 'icpc-regional-collegiate-2026',
    title: 'ICPC Regional Collegiate Invitational 2026',
    subtitle: 'Official Collegiate Algorithmic Championship • Amritapuri & Kanpur Regional Practice',
    organizer: 'Prof. Arvind Krishnamurthy',
    organizerRole: 'ACM Regional Contest Chair & Senior CSE Faculty',
    college: 'Indian Collegiate Programming Consortium & IIT Network',
    startTime: new Date(Date.now() - 3600000 * 1).toISOString(), // 1 hour ago (Live)
    endTime: new Date(Date.now() + 3600000 * 4).toISOString(), // 4 hours left
    contestType: 'contest',
    durationMinutes: 300,
    status: 'live',
    visibility: 'public',
    bannerGradient: 'from-blue-600 via-indigo-600 to-violet-700',
    participantCount: 412,
    scoringType: 'icpc',
    rules: [
      'Solutions may be submitted in C++ (GCC 9.2+), Java (OpenJDK 17), or Python 3 (3.11+).',
      'Execution limits: 2.0s CPU time and 256MB RAM per test case.',
      'ICPC Scoring: Each accepted problem awards full points. Incorrect submissions incur a 20-minute penalty on acceptance.',
      'Submissions are compiled and verified on standard Linux x86-64 runners.',
    ],
    problems: [
      {
        id: 'icpc-xor-subarrays',
        title: 'Problem A: Subarray Bitwise Parity Balance',
        difficulty: 'Easy',
        points: 100,
        timeLimit: '1.0s',
        memoryLimit: '256MB',
        tags: ['Prefix XOR', 'Hash Map', 'Bit Manipulation'],
        description:
          'In a campus telemetry network, a sequence of N optical sensor pulses is recorded as integer energy readings A_1, A_2, ..., A_N.\n\nA contiguous transmission window from index L to index R (1 <= L <= R <= N) is defined as "balanced" if the bitwise XOR sum of all energy values in that window is exactly 0:\n\n    A[L] ^ A[L+1] ^ ... ^ A[R] = 0\n\nYour task is to calculate the total number of non-empty balanced contiguous subarrays.',
        inputFormat:
          'The first line contains a single integer T (1 <= T <= 10) denoting the number of test cases.\nFor each testcase:\n- The first line contains an integer N (1 <= N <= 100,000), the length of the array.\n- The second line contains N space-separated integers A_1, A_2, ..., A_N (0 <= A_i <= 10^9).',
        outputFormat:
          'For each test case, print a single integer representing the number of balanced subarrays on a new line.',
        constraints:
          '1 <= T <= 10\n1 <= N <= 100,000\n0 <= A_i <= 10^9\nSum of N over all test cases <= 200,000',
        sampleInput: '2\n4\n4 2 2 4\n5\n1 2 3 4 5',
        sampleOutput: '2\n1',
        explanation:
          'In test case 1 [4, 2, 2, 4]:\n- Subarray [2, 2] from index 2 to 3 has XOR = 2 ^ 2 = 0.\n- Subarray [4, 2, 2, 4] from index 1 to 4 has XOR = 4 ^ 2 ^ 2 ^ 4 = 0.\nTotal = 2 balanced subarrays.\n\nIn testcase 2 [1, 2, 3, 4, 5]:\n- Subarray [1, 2, 3] from index 1 to 3 has XOR = 1 ^ 2 ^ 3 = 0.\nTotal = 1 balanced subarray.',
        testCases: [
          {
            input: '2\n4\n4 2 2 4\n5\n1 2 3 4 5',
            output: '2\n1',
            isHidden: false,
          },
          {
            input: '1\n3\n0 0 0',
            output: '6',
            isHidden: true,
          },
          {
            input: '1\n6\n1 1 1 1 1 1',
            output: '6',
            isHidden: true,
          },
        ],
        starterCode: {
          cpp: `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

void solve() {
    int n;
    if (!(cin >> n)) return;
    vector<long long> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }

    // Write your O(N) prefix XOR solution here
    long long ans = 0;
    long long pref = 0;
    unordered_map<long long, long long> freq;
    freq[0] = 1;

    for (int i = 0; i < n; i++) {
        pref ^= a[i];
        ans += freq[pref];
        freq[pref]++;
    }

    cout << ans << "\\n";
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int t = 1;
    if (cin >> t) {
        while (t--) {
            solve();
        }
    }
    return 0;
}`,
          java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        int t = Integer.parseInt(line.trim());

        while (t-- > 0) {
            int n = Integer.parseInt(br.readLine().trim());
            StringTokenizer st = new StringTokenizer(br.readLine());
            
            long ans = 0;
            long pref = 0;
            Map<Long, Long> freq = new HashMap<>();
            freq.put(0L, 1L);

            for (int i = 0; i < n; i++) {
                long val = Long.parseLong(st.nextToken());
                pref ^= val;
                ans += freq.getOrDefault(pref, 0L);
                freq.put(pref, freq.getOrDefault(pref, 0L) + 1L);
            }

            System.out.println(ans);
        }
    }
}`,
          python: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    
    t = int(input_data[0])
    idx = 1
    
    for _ in range(t):
        n = int(input_data[idx])
        idx += 1
        
        freq = {0: 1}
        pref = 0
        ans = 0
        
        for _ in range(n):
            val = int(input_data[idx])
            idx += 1
            pref ^= val
            ans += freq.get(pref, 0)
            freq[pref] = freq.get(pref, 0) + 1
            
        print(ans)

if __name__ == '__main__':
    solve()`,
        },
        solutionLanguage: 'cpp',
        solutionCode: `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

// O(N) time with O(N) space using Prefix XOR & Frequency Map
void solve() {
    int n;
    cin >> n;
    long long ans = 0;
    long long pref = 0;
    unordered_map<long long, long long> freq;
    freq[0] = 1;

    for (int i = 0; i < n; i++) {
        long long val;
        cin >> val;
        pref ^= val;
        ans += freq[pref];
        freq[pref]++;
    }

    cout << ans << "\\n";
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int t;
    if (cin >> t) {
        while (t--) solve();
    }
    return 0;
}`,
        solutionExplanation:
          'Let P[i] = A[1] ^ A[2] ^ ... ^ A[i], with P[0] = 0. The XOR sum of subarray A[L..R] is P[R] ^ P[L-1]. Hence, A[L..R] == 0 if and only if P[R] == P[L-1]. By iterating through the array and keeping track of the frequencies of each prefix XOR in a hash map, we can compute the answer in O(N) time and O(N) space.',
      },
      {
        id: 'icpc-fiber-mst',
        title: 'Problem B: Campus Optical Fiber Backbone',
        difficulty: 'Medium',
        points: 200,
        timeLimit: '1.5s',
        memoryLimit: '256MB',
        tags: ['Graphs', 'Minimum Spanning Tree', 'Kruskal', 'Disjoint Set Union'],
        description:
          'The university IT administration is laying high-speed optical fiber cables connecting N departmental buildings, numbered 1 to N.\n\nThere are M bidirectional candidate cable conduits available. The i-th conduit connects building u_i and building v_i, and the excavation cost to install fiber optic cable in this conduit is w_i.\n\nYour task is to choose a subset of conduits that connects all N buildings together such that the total excavation cost is minimized. If it is impossible to connect all N buildings, output -1.',
        inputFormat:
          'The first line contains two integers N and M (1 <= N <= 100,000; 1 <= M <= 200,000), denoting the number of buildings and candidate conduits.\nEach of the next M lines contains three integers u_i, v_i, and w_i (1 <= u_i, v_i <= N; 1 <= w_i <= 10^9), describing an available conduit between u_i and v_i with cost w_i.',
        outputFormat:
          'Print a single integer: the minimum total excavation cost to connect all buildings, or -1 if the network cannot be fully connected.',
        constraints:
          '1 <= N <= 100,000\n1 <= M <= 200,000\n1 <= u_i, v_i <= N\n1 <= w_i <= 10^9',
        sampleInput: '4 5\n1 2 10\n2 3 15\n1 3 20\n3 4 5\n2 4 25',
        sampleOutput: '30',
        explanation:
          'Select conduits:\n- (3, 4) with cost 5\n- (1, 2) with cost 10\n- (2, 3) with cost 15\nTotal minimum cost = 5 + 10 + 15 = 30. All 4 buildings are connected.',
        testCases: [
          {
            input: '4 5\n1 2 10\n2 3 15\n1 3 20\n3 4 5\n2 4 25',
            output: '30',
            isHidden: false,
          },
          {
            input: '3 1\n1 2 5',
            output: '-1',
            isHidden: true,
          },
          {
            input: '5 7\n1 2 1\n2 3 2\n3 4 3\n4 5 4\n1 5 10\n2 4 6\n1 3 8',
            output: '10',
            isHidden: true,
          },
        ],
        starterCode: {
          cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

struct Edge {
    int u, v;
    long long w;
    bool operator<(const Edge& other) const {
        return w < other.w;
    }
};

struct DSU {
    vector<int> parent;
    DSU(int n) {
        parent.resize(n + 1);
        for (int i = 0; i <= n; i++) parent[i] = i;
    }
    int find(int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent[i]);
    }
    bool unite(int i, int j) {
        int root_i = find(i);
        int root_j = find(j);
        if (root_i != root_j) {
            parent[root_i] = root_j;
            return true;
        }
        return false;
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, m;
    if (!(cin >> n >> m)) return 0;

    vector<Edge> edges(m);
    for (int i = 0; i < m; i++) {
        cin >> edges[i].u >> edges[i].v >> edges[i].w;
    }

    sort(edges.begin(), edges.end());

    DSU dsu(n);
    long long total_cost = 0;
    int edges_used = 0;

    for (const auto& edge : edges) {
        if (dsu.unite(edge.u, edge.v)) {
            total_cost += edge.w;
            edges_used++;
            if (edges_used == n - 1) break;
        }
    }

    if (edges_used == n - 1) {
        cout << total_cost << "\\n";
    } else {
        cout << -1 << "\\n";
    }

    return 0;
}`,
          java: `import java.util.*;
import java.io.*;

public class Main {
    static class Edge implements Comparable<Edge> {
        int u, v;
        long w;
        Edge(int u, int v, long w) {
            this.u = u;
            this.v = v;
            this.w = w;
        }
        public int compareTo(Edge other) {
            return Long.compare(this.w, other.w);
        }
    }

    static class DSU {
        int[] parent;
        DSU(int n) {
            parent = new int[n + 1];
            for (int i = 0; i <= n; i++) parent[i] = i;
        }
        int find(int i) {
            if (parent[i] == i) return i;
            return parent[i] = find(parent[i]);
        }
        boolean unite(int i, int j) {
            int root_i = find(i);
            int root_j = find(j);
            if (root_i != root_j) {
                parent[root_i] = root_j;
                return true;
            }
            return false;
        }
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken());
        int m = Integer.parseInt(st.nextToken());

        List<Edge> edges = new ArrayList<>(m);
        for (int i = 0; i < m; i++) {
            st = new StringTokenizer(br.readLine());
            int u = Integer.parseInt(st.nextToken());
            int v = Integer.parseInt(st.nextToken());
            long w = Long.parseLong(st.nextToken());
            edges.add(new Edge(u, v, w));
        }

        Collections.sort(edges);
        DSU dsu = new DSU(n);
        long totalCost = 0;
        int edgesCount = 0;

        for (Edge e : edges) {
            if (dsu.unite(e.u, e.v)) {
                totalCost += e.w;
                edgesCount++;
                if (edgesCount == n - 1) break;
            }
        }

        if (edgesCount == n - 1) {
            System.out.println(totalCost);
        } else {
            System.out.println(-1);
        }
    }
}`,
          python: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    
    n = int(input_data[0])
    m = int(input_data[1])
    
    edges = []
    idx = 2
    for _ in range(m):
        u = int(input_data[idx])
        v = int(input_data[idx+1])
        w = int(input_data[idx+2])
        idx += 3
        edges.append((w, u, v))
        
    edges.sort()
    
    parent = list(range(n + 1))
    
    def find(i):
        if parent[i] == i:
            return i
        parent[i] = find(parent[i])
        return parent[i]
        
    def unite(i, j):
        root_i = find(i)
        root_j = find(j)
        if root_i != root_j:
            parent[root_i] = root_j
            return True
        return False
        
    total_cost = 0
    edges_used = 0
    
    for w, u, v in edges:
        if unite(u, v):
            total_cost += w
            edges_used += 1
            if edges_used == n - 1:
                break
                
    if edges_used == n - 1:
        print(total_cost)
    else:
        print(-1)

if __name__ == '__main__':
    solve()`,
        },
        solutionLanguage: 'cpp',
        solutionCode: `// Kruskal's MST algorithm with Disjoint Set Union (DSU)
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

struct Edge {
    int u, v;
    long long w;
    bool operator<(const Edge& other) const {
        return w < other.w;
    }
};

struct DSU {
    vector<int> parent;
    DSU(int n) {
        parent.resize(n + 1);
        for (int i = 0; i <= n; i++) parent[i] = i;
    }
    int find(int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent[i]);
    }
    bool unite(int i, int j) {
        int root_i = find(i);
        int root_j = find(j);
        if (root_i != root_j) {
            parent[root_i] = root_j;
            return true;
        }
        return false;
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n, m;
    if (!(cin >> n >> m)) return 0;

    vector<Edge> edges(m);
    for (int i = 0; i < m; i++) {
        cin >> edges[i].u >> edges[i].v >> edges[i].w;
    }

    sort(edges.begin(), edges.end());
    DSU dsu(n);

    long long total_cost = 0;
    int edges_used = 0;

    for (const auto& edge : edges) {
        if (dsu.unite(edge.u, edge.v)) {
            total_cost += edge.w;
            edges_used++;
            if (edges_used == n - 1) break;
        }
    }

    if (edges_used == n - 1) cout << total_cost << "\\n";
    else cout << -1 << "\\n";

    return 0;
}`,
        solutionExplanation:
          "Kruskal's algorithm finds the Minimum Spanning Tree by sorting edges by weight in O(M log M) time and using Disjoint Set Union (DSU) with path compression to add edges that do not form a cycle. If fewer than N - 1 edges are selected, the graph is disconnected, returning -1. Time Complexity: O(M log M), Space Complexity: O(N + M).",
      },
      {
        id: 'icpc-shortest-flight-energy',
        title: 'Problem C: Drone Delivery with Fuel Tank Constraint',
        difficulty: 'Medium',
        points: 250,
        timeLimit: '2.0s',
        memoryLimit: '256MB',
        tags: ['Graphs', 'Dijkstra', 'Shortest Path', 'Heaps'],
        description:
          'An autonomous delivery drone must travel from campus warehouse 1 to testing lab N across a network of N landing pads and M flight corridors.\n\nThe i-th flight corridor connects landing pad u_i to v_i in t_i minutes and consumes e_i percent of the battery. The drone starts with a full 100% battery charge.\n\nCertain landing pads have rapid charging docks where the drone can instantly recharge to 100%. If the drone reaches a landing pad with less than 0% battery, it crashes.\n\nFind the minimum flight time required to reach landing pad N without crashing, or output -1 if destination N cannot be reached safely.',
        inputFormat:
          'First line: N (landing pads), M (corridors), and C (number of recharge pads).\nSecond line: C integers indicating which landing pads possess rapid charging stations.\nNext M lines: four integers u_i, v_i, t_i, e_i (1 <= u_i, v_i <= N; 1 <= t_i <= 10^5; 1 <= e_i <= 100). Corridors are bidirectional.',
        outputFormat:
          'Print a single integer: the minimum travel time in minutes from landing pad 1 to pad N, or -1 if impossible.',
        constraints:
          '2 <= N <= 1,000\n1 <= M <= 10,000\n0 <= C <= N\n1 <= t_i <= 10^5\n1 <= e_i <= 100\nInitial battery is 100%',
        sampleInput: '4 4 1\n2\n1 2 10 60\n2 3 15 70\n1 3 50 90\n3 4 5 30',
        sampleOutput: '30',
        explanation:
          'Path: 1 -> 2 (time 10, battery becomes 100 - 60 = 40%). Landing pad 2 has a recharge dock, resetting battery to 100%. Then 2 -> 3 (time 15, battery 30%). Then 3 -> 4 (time 5, battery 0%). Total time = 10 + 15 + 5 = 30.',
        testCases: [
          {
            input: '4 4 1\n2\n1 2 10 60\n2 3 15 70\n1 3 50 90\n3 4 5 30',
            output: '30',
            isHidden: false,
          },
          {
            input: '2 1 0\n\n1 2 5 101',
            output: '-1',
            isHidden: true,
          },
        ],
        starterCode: {
          cpp: `#include <iostream>
#include <vector>
#include <queue>

using namespace std;

const long long INF = 1e18;

struct Edge {
    int to;
    long long time;
    int energy;
};

struct State {
    long long time;
    int u;
    int battery;
    bool operator>(const State& other) const {
        return time > other.time;
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, m, c;
    if (!(cin >> n >> m >> c)) return 0;

    vector<bool> isRecharge(n + 1, false);
    for (int i = 0; i < c; i++) {
        int pad;
        cin >> pad;
        isRecharge[pad] = true;
    }

    vector<vector<Edge>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v;
        long long t;
        int e;
        cin >> u >> v >> t >> e;
        adj[u].push_back({v, t, e});
        adj[v].push_back({u, t, e});
    }

    // 2D Dijkstra: dist[u][battery]
    vector<vector<long long>> dist(n + 1, vector<long long>(101, INF));
    priority_queue<State, vector<State>, greater<State>> pq;

    dist[1][100] = 0;
    pq.push({0, 1, 100});

    while (!pq.empty()) {
        auto [d, u, bat] = pq.top();
        pq.pop();

        if (d > dist[u][bat]) continue;
        if (u == n) {
            cout << d << "\\n";
            return 0;
        }

        int currBat = isRecharge[u] ? 100 : bat;

        for (const auto& edge : adj[u]) {
            if (currBat >= edge.energy) {
                int nextBat = currBat - edge.energy;
                if (isRecharge[edge.to]) nextBat = 100;

                if (dist[u][bat] + edge.time < dist[edge.to][nextBat]) {
                    dist[edge.to][nextBat] = dist[u][bat] + edge.time;
                    pq.push({dist[edge.to][nextBat], edge.to, nextBat});
                }
            }
        }
    }

    long long ans = INF;
    for (int b = 0; b <= 100; b++) {
        ans = min(ans, dist[n][b]);
    }

    if (ans >= INF) cout << -1 << "\\n";
    else cout << ans << "\\n";

    return 0;
}`,
          java: `import java.util.*;
import java.io.*;

public class Main {
    static class Edge {
        int to;
        long time;
        int energy;
        Edge(int to, long time, int energy) {
            this.to = to;
            this.time = time;
            this.energy = energy;
        }
    }

    static class State implements Comparable<State> {
        long time;
        int u;
        int battery;
        State(long time, int u, int battery) {
            this.time = time;
            this.u = u;
            this.battery = battery;
        }
        public int compareTo(State other) {
            return Long.compare(this.time, other.time);
        }
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken());
        int m = Integer.parseInt(st.nextToken());
        int c = Integer.parseInt(st.nextToken());

        boolean[] isRecharge = new boolean[n + 1];
        if (c > 0) {
            st = new StringTokenizer(br.readLine());
            for (int i = 0; i < c; i++) {
                isRecharge[Integer.parseInt(st.nextToken())] = true;
            }
        }

        List<List<Edge>> adj = new ArrayList<>();
        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());

        for (int i = 0; i < m; i++) {
            st = new StringTokenizer(br.readLine());
            int u = Integer.parseInt(st.nextToken());
            int v = Integer.parseInt(st.nextToken());
            long t = Long.parseLong(st.nextToken());
            int e = Integer.parseInt(st.nextToken());
            adj.get(u).add(new Edge(v, t, e));
            adj.get(v).add(new Edge(u, t, e));
        }

        long INF = (long) 1e18;
        long[][] dist = new long[n + 1][101];
        for (long[] row : dist) Arrays.fill(row, INF);

        PriorityQueue<State> pq = new PriorityQueue<>();
        dist[1][100] = 0;
        pq.add(new State(0, 1, 100));

        while (!pq.isEmpty()) {
            State curr = pq.poll();
            if (curr.time > dist[curr.u][curr.battery]) continue;
            if (curr.u == n) {
                System.out.println(curr.time);
                return;
            }

            int currBat = isRecharge[curr.u] ? 100 : curr.battery;

            for (Edge edge : adj.get(curr.u)) {
                if (currBat >= edge.energy) {
                    int nextBat = isRecharge[edge.to] ? 100 : currBat - edge.energy;
                    if (dist[curr.u][curr.battery] + edge.time < dist[edge.to][nextBat]) {
                        dist[edge.to][nextBat] = dist[curr.u][curr.battery] + edge.time;
                        pq.add(new State(dist[edge.to][nextBat], edge.to, nextBat));
                    }
                }
            }
        }

        long ans = INF;
        for (int b = 0; b <= 100; b++) {
            ans = Math.min(ans, dist[n][b]);
        }

        if (ans >= INF) System.out.println(-1);
        else System.out.println(ans);
    }
}`,
          python: `import sys
import heapq

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    
    n = int(input_data[0])
    m = int(input_data[1])
    c = int(input_data[2])
    
    idx = 3
    is_recharge = [False] * (n + 1)
    for _ in range(c):
        pad = int(input_data[idx])
        idx += 1
        is_recharge[pad] = True
        
    adj = [[] for _ in range(n + 1)]
    for _ in range(m):
        u = int(input_data[idx])
        v = int(input_data[idx+1])
        t = int(input_data[idx+2])
        e = int(input_data[idx+3])
        idx += 4
        adj[u].append((v, t, e))
        adj[v].append((u, t, e))
        
    INF = float('inf')
    dist = [[INF] * 101 for _ in range(n + 1)]
    dist[1][100] = 0
    pq = [(0, 1, 100)]
    
    while pq:
        d, u, bat = heapq.heappop(pq)
        if d > dist[u][bat]:
            continue
        if u == n:
            print(d)
            return
            
        curr_bat = 100 if is_recharge[u] else bat
        for v, t, e in adj[u]:
            if curr_bat >= e:
                next_bat = 100 if is_recharge[v] else (curr_bat - e)
                if d + t < dist[v][next_bat]:
                    dist[v][next_bat] = d + t
                    heapq.heappush(pq, (d + t, v, next_bat))
                    
    ans = min(dist[n])
    if ans >= INF:
        print(-1)
    else:
        print(ans)

if __name__ == '__main__':
    solve()`,
        },
        solutionLanguage: 'cpp',
        solutionCode: `// 2D Dijkstra shortest path on State graph (node, battery)
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

const long long INF = 1e18;

struct Edge { int to; long long time; int energy; };
struct State {
    long long time; int u, battery;
    bool operator>(const State& o) const { return time > o.time; }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n, m, c;
    if (!(cin >> n >> m >> c)) return 0;
    vector<bool> isRecharge(n + 1, false);
    for (int i = 0; i < c; i++) { int p; cin >> p; isRecharge[p] = true; }
    vector<vector<Edge>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v; long long t; int e; cin >> u >> v >> t >> e;
        adj[u].push_back({v, t, e}); adj[v].push_back({u, t, e});
    }
    vector<vector<long long>> dist(n + 1, vector<long long>(101, INF));
    priority_queue<State, vector<State>, greater<State>> pq;
    dist[1][100] = 0; pq.push({0, 1, 100});
    while (!pq.empty()) {
        auto [d, u, bat] = pq.top(); pq.pop();
        if (d > dist[u][bat]) continue;
        if (u == n) { cout << d << "\\n"; return 0; }
        int currBat = isRecharge[u] ? 100 : bat;
        for (const auto& e : adj[u]) {
            if (currBat >= e.energy) {
                int nextBat = isRecharge[e.to] ? 100 : currBat - e.energy;
                if (d + e.time < dist[e.to][nextBat]) {
                    dist[e.to][nextBat] = d + e.time;
                    pq.push({dist[e.to][nextBat], e.to, nextBat});
                }
            }
        }
    }
    long long ans = INF;
    for (int b = 0; b <= 100; b++) ans = min(ans, dist[n][b]);
    if (ans >= INF) cout << -1 << "\\n"; else cout << ans << "\\n";
    return 0;
}`,
        solutionExplanation:
          'We construct an augmented state graph where each node represents (landing_pad, battery_level). Since battery is bounded in [0, 100], there are N * 101 states. We run Dijkstra with priority queue. Recharging pads reset battery to 100%. Complexity: O(100 * M log(100 * N)), perfectly within 2.0s limit.',
      },
    ],
  },
  {
    id: 'icpc-practice-dsa-mastery',
    title: 'Collegiate DSA Practice Arena: Core Algorithms',
    subtitle: 'Competitive Programming Benchmark • Trees, Stacks, DP & Graph Algorithms',
    organizer: 'Dr. Radhika Sen',
    organizerRole: 'Associate Professor & Algorithms Lab Lead',
    college: 'National Institute of Technology & Autonomous Collegiate Chapter',
    startTime: new Date(Date.now() - 3600000 * 48).toISOString(),
    endTime: new Date(Date.now() + 3600000 * 720).toISOString(),
    contestType: 'practice',
    durationMinutes: 1440,
    status: 'live',
    visibility: 'public',
    bannerGradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    participantCount: 789,
    scoringType: 'leetcode',
    rules: [
      'Self-paced practice problems with real testbench verification in C++, Java, and Python.',
      'Check time complexity before submitting — naive O(N^2) approaches will trigger Time Limit Exceeded.',
      'View detailed editorial explanations and optimal reference implementations.',
    ],
    problems: [
      {
        id: 'dsa-course-schedule',
        title: 'Problem A: University Course Prerequisite Scheduler',
        difficulty: 'Medium',
        points: 150,
        timeLimit: '1.0s',
        memoryLimit: '256MB',
        tags: ['Graphs', 'Topological Sort', 'Kahn Algorithm', 'BFS', 'Cycle Detection'],
        description:
          'A student wants to complete N courses at university, labeled from 0 to N - 1.\n\nYou are given an array of prerequisite pairs, where prerequisites[i] = [a, b] indicates that you must take course b before course a.\n\nReturn the ordering of courses the student should take to finish all courses. If there are multiple valid orders, return any valid topological order. If it is impossible to finish all courses due to circular dependencies, output "IMPOSSIBLE".',
        inputFormat:
          'First line: N (number of courses) and M (number of prerequisite dependencies).\nFollowing M lines: two integers a and b (indicating course b must be taken before course a).',
        outputFormat:
          'Print the space-separated course IDs in a valid completion order. If impossible, print "IMPOSSIBLE".',
        constraints:
          '1 <= N <= 100,000\n0 <= M <= 200,000\n0 <= a, b < N\na != b',
        sampleInput: '4 4\n1 0\n2 0\n3 1\n3 2',
        sampleOutput: '0 1 2 3',
        explanation:
          'To take 1 and 2, take 0 first. Then 1 and 2 can be taken in any order. Finally, course 3 requires both 1 and 2. Output 0 1 2 3 (or 0 2 1 3) is valid.',
        testCases: [
          {
            input: '4 4\n1 0\n2 0\n3 1\n3 2',
            output: '0 1 2 3',
            isHidden: false,
          },
          {
            input: '2 2\n1 0\n0 1',
            output: 'IMPOSSIBLE',
            isHidden: true,
          },
          {
            input: '3 0',
            output: '0 1 2',
            isHidden: true,
          },
        ],
        starterCode: {
          cpp: `#include <iostream>
#include <vector>
#include <queue>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, m;
    if (!(cin >> n >> m)) return 0;

    vector<vector<int>> adj(n);
    vector<int> inDegree(n, 0);

    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        // b -> a
        adj[b].push_back(a);
        inDegree[a]++;
    }

    queue<int> q;
    for (int i = 0; i < n; i++) {
        if (inDegree[i] == 0) q.push(i);
    }

    vector<int> order;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);

        for (int v : adj[u]) {
            inDegree[v]--;
            if (inDegree[v] == 0) {
                q.push(v);
            }
        }
    }

    if ((int)order.size() == n) {
        for (int i = 0; i < n; i++) {
            cout << order[i] << (i + 1 == n ? "" : " ");
        }
        cout << "\\n";
    } else {
        cout << "IMPOSSIBLE\\n";
    }

    return 0;
}`,
          java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken());
        int m = Integer.parseInt(st.nextToken());

        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        int[] inDegree = new int[n];

        for (int i = 0; i < m; i++) {
            st = new StringTokenizer(br.readLine());
            int a = Integer.parseInt(st.nextToken());
            int b = Integer.parseInt(st.nextToken());
            adj.get(b).add(a);
            inDegree[a]++;
        }

        Queue<Integer> q = new LinkedList<>();
        for (int i = 0; i < n; i++) {
            if (inDegree[i] == 0) q.add(i);
        }

        List<Integer> order = new ArrayList<>();
        while (!q.isEmpty()) {
            int u = q.poll();
            order.add(u);
            for (int v : adj.get(u)) {
                inDegree[v]--;
                if (inDegree[v] == 0) q.add(v);
            }
        }

        if (order.size() == n) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < n; i++) {
                sb.append(order.get(i)).append(i + 1 == n ? "" : " ");
            }
            System.out.println(sb.toString());
        } else {
            System.out.println("IMPOSSIBLE");
        }
    }
}`,
          python: `import sys
from collections import deque

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    
    n = int(input_data[0])
    m = int(input_data[1])
    
    adj = [[] for _ in range(n)]
    in_degree = [0] * n
    idx = 2
    
    for _ in range(m):
        a = int(input_data[idx])
        b = int(input_data[idx+1])
        idx += 2
        adj[b].append(a)
        in_degree[a] += 1
        
    q = deque([i for i in range(n) if in_degree[i] == 0])
    order = []
    
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                q.append(v)
                
    if len(order) == n:
        print(*(order))
    else:
        print("IMPOSSIBLE")

if __name__ == '__main__':
    solve()`,
        },
        solutionLanguage: 'cpp',
        solutionCode: `// Kahn's Algorithm for Topological Sorting in O(V + E)
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n, m;
    if (!(cin >> n >> m)) return 0;
    vector<vector<int>> adj(n);
    vector<int> inDegree(n, 0);
    for (int i = 0; i < m; i++) {
        int a, b; cin >> a >> b;
        adj[b].push_back(a);
        inDegree[a]++;
    }
    queue<int> q;
    for (int i = 0; i < n; i++) if (inDegree[i] == 0) q.push(i);
    vector<int> order;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : adj[u]) {
            if (--inDegree[v] == 0) q.push(v);
        }
    }
    if ((int)order.size() == n) {
        for (int i = 0; i < n; i++) cout << order[i] << (i + 1 == n ? "" : " ");
        cout << "\\n";
    } else {
        cout << "IMPOSSIBLE\\n";
    }
    return 0;
}`,
        solutionExplanation:
          "We model courses as vertices and prerequisites as directed edges (b -> a). We compute in-degrees for each vertex and push all 0-indegree vertices to a queue. As each vertex is popped, we decrement in-degrees of neighbors. If the resulting topological order contains all N vertices, a valid schedule exists. If fewer than N vertices are processed, a cycle exists (deadlock), returning IMPOSSIBLE.",
      },
      {
        id: 'dsa-coin-change-dp',
        title: 'Problem B: Minimum Currency Note Dispenser',
        difficulty: 'Easy',
        points: 100,
        timeLimit: '1.0s',
        memoryLimit: '256MB',
        tags: ['Dynamic Programming', 'Unbounded Knapsack'],
        description:
          'A collegiate smart campus automated cash machine has access to coins/notes of N different denominations C = [c_1, c_2, ..., c_N]. You have an infinite supply of each denomination.\n\nGiven target withdrawal amount V, compute the minimum number of coins/notes needed to make up that amount. If that amount of money cannot be made up by any combination of the coins, output -1.',
        inputFormat:
          'First line: two integers N (number of coin denominations) and V (target amount).\nSecond line: N space-separated integers representing the denominations c_1, c_2, ..., c_N.',
        outputFormat:
          'Print a single integer: the minimum number of coins needed, or -1 if impossible.',
        constraints:
          '1 <= N <= 100\n1 <= V <= 100,000\n1 <= c_i <= 10^5',
        sampleInput: '3 11\n1 2 5',
        sampleOutput: '3',
        explanation: '11 = 5 + 5 + 1 (3 coins). Minimum coins possible.',
        testCases: [
          {
            input: '3 11\n1 2 5',
            output: '3',
            isHidden: false,
          },
          {
            input: '1 3\n2',
            output: '-1',
            isHidden: true,
          },
          {
            input: '4 6249\n186 419 83 408',
            output: '20',
            isHidden: true,
          },
        ],
        starterCode: {
          cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    long long v;
    if (!(cin >> n >> v)) return 0;

    vector<int> coins(n);
    for (int i = 0; i < n; i++) cin >> coins[i];

    const int INF = 1e9;
    vector<int> dp(v + 1, INF);
    dp[0] = 0;

    for (int c : coins) {
        for (int i = c; i <= v; i++) {
            if (dp[i - c] != INF) {
                dp[i] = min(dp[i], dp[i - c] + 1);
            }
        }
    }

    if (dp[v] >= INF) cout << -1 << "\\n";
    else cout << dp[v] << "\\n";

    return 0;
}`,
          java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken());
        int v = Integer.parseInt(st.nextToken());

        st = new StringTokenizer(br.readLine());
        int[] coins = new int[n];
        for (int i = 0; i < n; i++) coins[i] = Integer.parseInt(st.nextToken());

        int INF = (int) 1e9;
        int[] dp = new int[v + 1];
        Arrays.fill(dp, INF);
        dp[0] = 0;

        for (int c : coins) {
            for (int i = c; i <= v; i++) {
                if (dp[i - c] != INF) {
                    dp[i] = Math.min(dp[i], dp[i - c] + 1);
                }
            }
        }

        System.out.println(dp[v] >= INF ? -1 : dp[v]);
    }
}`,
          python: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    
    n = int(input_data[0])
    v = int(input_data[1])
    coins = [int(x) for x in input_data[2:2+n]]
    
    INF = float('inf')
    dp = [INF] * (v + 1)
    dp[0] = 0
    
    for c in coins:
        for i in range(c, v + 1):
            if dp[i - c] + 1 < dp[i]:
                dp[i] = dp[i - c] + 1
                
    ans = dp[v]
    print(-1 if ans == INF else ans)

if __name__ == '__main__':
    solve()`,
        },
        solutionLanguage: 'cpp',
        solutionCode: `// Bottom-up 1D DP in O(N * V)
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n, v;
    if (!(cin >> n >> v)) return 0;
    vector<int> coins(n);
    for (int i = 0; i < n; i++) cin >> coins[i];

    const int INF = 1e9;
    vector<int> dp(v + 1, INF);
    dp[0] = 0;

    for (int c : coins) {
        for (int i = c; i <= v; i++) {
            if (dp[i - c] != INF) {
                dp[i] = min(dp[i], dp[i - c] + 1);
            }
        }
    }

    cout << (dp[v] >= INF ? -1 : dp[v]) << "\\n";
    return 0;
}`,
        solutionExplanation:
          'Define dp[i] as the minimum coins needed to make sum i. Base case: dp[0] = 0, and all other dp[i] = infinity. Transition: for each coin c and sum i from c to V, dp[i] = min(dp[i], dp[i - c] + 1). Time Complexity: O(N * V), Space Complexity: O(V).',
      },
      {
        id: 'dsa-merit-inversions',
        title: 'Problem C: Student Merit List Inversion Count',
        difficulty: 'Hard',
        points: 250,
        timeLimit: '1.5s',
        memoryLimit: '256MB',
        tags: ['Merge Sort', 'Fenwick Tree', 'Divide & Conquer', 'Binary Indexed Tree'],
        description:
          'In a competitive collegiate test, student ranks from two different examination sessions are compared.\n\nYou are given an array A of N distinct integers representing student roll numbers ordered by their score rank.\n\nAn "inversion pair" is a pair of indices (i, j) such that 1 <= i < j <= N and A[i] > A[j]. Calculate the total number of inversion pairs in array A in O(N log N) time.',
        inputFormat:
          'First line: integer N (1 <= N <= 200,000), the length of array A.\nSecond line: N space-separated distinct integers A_1, A_2, ..., A_N (1 <= A_i <= 10^9).',
        outputFormat:
          'Print a single 64-bit integer: the total number of inversion pairs.',
        constraints:
          '1 <= N <= 200,000\n1 <= A_i <= 10^9\nAll elements are distinct',
        sampleInput: '5\n2 4 1 3 5',
        sampleOutput: '3',
        explanation: 'Inversions are (2, 1), (4, 1), and (4, 3). Total = 3.',
        testCases: [
          {
            input: '5\n2 4 1 3 5',
            output: '3',
            isHidden: false,
          },
          {
            input: '5\n5 4 3 2 1',
            output: '10',
            isHidden: true,
          },
          {
            input: '4\n1 2 3 4',
            output: '0',
            isHidden: true,
          },
        ],
        starterCode: {
          cpp: `#include <iostream>
#include <vector>

using namespace std;

long long mergeAndCount(vector<long long>& arr, vector<long long>& temp, int left, int mid, int right) {
    int i = left;
    int j = mid + 1;
    int k = left;
    long long inv_count = 0;

    while ((i <= mid) && (j <= right)) {
        if (arr[i] <= arr[j]) {
            temp[k++] = arr[i++];
        } else {
            temp[k++] = arr[j++];
            inv_count += (mid - i + 1);
        }
    }

    while (i <= mid) temp[k++] = arr[i++];
    while (j <= right) temp[k++] = arr[j++];
    for (i = left; i <= right; i++) arr[i] = temp[i];

    return inv_count;
}

long long mergeSortAndCount(vector<long long>& arr, vector<long long>& temp, int left, int right) {
    long long inv_count = 0;
    if (left < right) {
        int mid = left + (right - left) / 2;
        inv_count += mergeSortAndCount(arr, temp, left, mid);
        inv_count += mergeSortAndCount(arr, temp, mid + 1, right);
        inv_count += mergeAndCount(arr, temp, left, mid, right);
    }
    return inv_count;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<long long> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];

    vector<long long> temp(n);
    long long ans = mergeSortAndCount(a, temp, 0, n - 1);

    cout << ans << "\\n";
    return 0;
}`,
          java: `import java.util.*;
import java.io.*;

public class Main {
    static long mergeAndCount(long[] arr, long[] temp, int left, int mid, int right) {
        int i = left;
        int j = mid + 1;
        int k = left;
        long inv_count = 0;

        while ((i <= mid) && (j <= right)) {
            if (arr[i] <= arr[j]) {
                temp[k++] = arr[i++];
            } else {
                temp[k++] = arr[j++];
                inv_count += (mid - i + 1);
            }
        }

        while (i <= mid) temp[k++] = arr[i++];
        while (j <= right) temp[k++] = arr[j++];
        for (i = left; i <= right; i++) arr[i] = temp[i];

        return inv_count;
    }

    static long mergeSortAndCount(long[] arr, long[] temp, int left, int right) {
        long inv_count = 0;
        if (left < right) {
            int mid = left + (right - left) / 2;
            inv_count += mergeSortAndCount(arr, temp, left, mid);
            inv_count += mergeSortAndCount(arr, temp, mid + 1, right);
            inv_count += mergeAndCount(arr, temp, left, mid, right);
        }
        return inv_count;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        int n = Integer.parseInt(line.trim());

        StringTokenizer st = new StringTokenizer(br.readLine());
        long[] a = new long[n];
        for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());

        long[] temp = new long[n];
        long ans = mergeSortAndCount(a, temp, 0, n - 1);
        System.out.println(ans);
    }
}`,
          python: `import sys

def merge_and_count(arr, temp, left, mid, right):
    i = left
    j = mid + 1
    k = left
    inv_count = 0
    
    while i <= mid and j <= right:
        if arr[i] <= arr[j]:
            temp[k] = arr[i]
            i += 1
        else:
            temp[k] = arr[j]
            inv_count += (mid - i + 1)
            j += 1
        k += 1
        
    while i <= mid:
        temp[k] = arr[i]
        i += 1
        k += 1
        
    while j <= right:
        temp[k] = arr[j]
        j += 1
        k += 1
        
    for idx in range(left, right + 1):
        arr[idx] = temp[idx]
        
    return inv_count

def merge_sort_and_count(arr, temp, left, right):
    inv_count = 0
    if left < right:
        mid = (left + right) // 2
        inv_count += merge_sort_and_count(arr, temp, left, mid)
        inv_count += merge_sort_and_count(arr, temp, mid + 1, right)
        inv_count += merge_and_count(arr, temp, left, mid, right)
    return inv_count

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    arr = [int(x) for x in input_data[1:n+1]]
    temp = [0] * n
    print(merge_sort_and_count(arr, temp, 0, n - 1))

if __name__ == '__main__':
    solve()`,
        },
        solutionLanguage: 'cpp',
        solutionCode: `// Enhanced Merge Sort Inversion Count in O(N log N)
#include <iostream>
#include <vector>
using namespace std;

long long mergeAndCount(vector<long long>& arr, vector<long long>& temp, int left, int mid, int right) {
    int i = left, j = mid + 1, k = left;
    long long inv_count = 0;
    while ((i <= mid) && (j <= right)) {
        if (arr[i] <= arr[j]) temp[k++] = arr[i++];
        else {
            temp[k++] = arr[j++];
            inv_count += (mid - i + 1);
        }
    }
    while (i <= mid) temp[k++] = arr[i++];
    while (j <= right) temp[k++] = arr[j++];
    for (i = left; i <= right; i++) arr[i] = temp[i];
    return inv_count;
}

long long mergeSortAndCount(vector<long long>& arr, vector<long long>& temp, int left, int right) {
    long long inv_count = 0;
    if (left < right) {
        int mid = left + (right - left) / 2;
        inv_count += mergeSortAndCount(arr, temp, left, mid);
        inv_count += mergeSortAndCount(arr, temp, mid + 1, right);
        inv_count += mergeAndCount(arr, temp, left, mid, right);
    }
    return inv_count;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<long long> a(n), temp(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    cout << mergeSortAndCount(a, temp, 0, n - 1) << "\\n";
    return 0;
}`,
        solutionExplanation:
          'Using the divide-and-conquer paradigm of Merge Sort, while merging two sorted halves L and R, whenever an element in R is smaller than an element in L, it forms an inversion pair with all remaining elements in L (mid - i + 1 elements). Overall time complexity: O(N log N), space complexity: O(N). Max possible inversions is N*(N-1)/2 which exceeds 32-bit signed integer, so we accumulate into a 64-bit long long.',
      },
    ],
  },
];
