function generateTeams() {
        // 1. Get Inputs
        const rawInput = document.getElementById('student-data').value.trim();
        const numGroups = parseInt(document.getElementById('group-count').value);
        const mode = document.getElementById('mode').value;
        const resultsArea = document.getElementById('results-area');

        // Validation
        if (!rawInput) {
            alert("Please enter student names.");
            return;
        }
        if (numGroups < 2) {
            alert("Please create at least 2 groups.");
            return;
        }

        // 2. Parse Data
        let students = rawInput.split('\n').filter(line => line.trim() !== '').map(line => {
            const parts = line.split(',');
            const name = parts[0].trim();
            // Parse score if it exists, otherwise default to 0
            const score = parts.length > 1 ? parseFloat(parts[1]) || 0 : 0;
            return { name, score };
        });

        if (students.length < numGroups) {
            alert("More groups than students! Reduce group count.");
            return;
        }

        // 3. Algorithm Selection
        let groups = Array.from({ length: numGroups }, () => []);

        if (mode === 'random') {
            // Shuffle Array (Fisher-Yates)
            for (let i = students.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [students[i], students[j]] = [students[j], students[i]];
            }
            // Distribute
            students.forEach((student, index) => {
                groups[index % numGroups].push(student);
            });
        } 
        else if (mode === 'balanced') {
            // Sort by score descending (High to Low)
            students.sort((a, b) => b.score - a.score);

            // Snake Distribution (1,2,3,4 -> 4,3,2,1) for better balance
            // This prevents Group 1 from always getting the best remaining player
            students.forEach((student, index) => {
                const cycle = Math.floor(index / numGroups);
                let groupIndex;
                
                if (cycle % 2 === 0) {
                    // Left to Right
                    groupIndex = index % numGroups;
                } else {
                    // Right to Left
                    groupIndex = (numGroups - 1) - (index % numGroups);
                }
                groups[groupIndex].push(student);
            });
        }

        // 4. Render Results
        resultsArea.innerHTML = '';
        
        groups.forEach((group, i) => {
            const totalScore = group.reduce((sum, s) => sum + s.score, 0);
            const avgScore = mode === 'balanced' ? (totalScore / group.length).toFixed(1) : '-';

            let html = `
                <div class="team-card">
                    <div class="team-header">
                        <h3>Group ${i + 1}</h3>
                        ${mode === 'balanced' ? `<span class="team-stats">Avg: ${avgScore}</span>` : ''}
                    </div>
                    <ul class="student-list">
            `;

            group.forEach(student => {
                html += `
                    <li>
                        <span>${student.name}</span>
                        ${mode === 'balanced' ? `<span class="score-tag">${student.score}</span>` : ''}
                    </li>
                `;
            });

            html += `</ul></div>`;
            resultsArea.innerHTML += html;
        });
    }

    function copyToClipboard() {
        const results = document.getElementById('results-area');
        if (!results.innerText) return;
        
        // Format text for clipboard
        let textToCopy = "";
        const cards = document.querySelectorAll('.team-card');
        
        cards.forEach(card => {
            textToCopy += card.querySelector('h3').innerText + "\n"; // Group Name
            card.querySelectorAll('li').forEach(li => {
                textToCopy += "- " + li.innerText.replace('\n', ' (') + (li.innerText.includes('\n') ? ')' : '') + "\n";
            });
            textToCopy += "\n";
        });

        navigator.clipboard.writeText(textToCopy).then(() => {
            alert("Teams copied to clipboard!");
        });
    }

    function clearAll() {
        document.getElementById('student-data').value = '';
        document.getElementById('results-area').innerHTML = '';
    }