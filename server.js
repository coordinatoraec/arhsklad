const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, 'data', 'tools.json');

// Ensure data directory and file exist
async function initializeDataFile() {
    try {
        await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
        try {
            await fs.access(dataPath);
        } catch {
            await fs.writeFile(dataPath, JSON.stringify([]));
        }
    } catch (error) {
        console.error('Error initializing data file:', error);
    }
}

initializeDataFile();

// Read tools from file
async function readTools() {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading tools:', error);
        return [];
    }
}

// Write tools to file
async function writeTools(tools) {
    try {
        await fs.writeFile(dataPath, JSON.stringify(tools, null, 2));
    } catch (error) {
        console.error('Error writing tools:', error);
        throw error;
    }
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

app.get('/api/tools', async (req, res) => {
    try {
        const tools = await readTools();
        res.json(tools);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/tools', async (req, res) => {
    try {
        const tools = await readTools();
        const newTool = {
            id: generateId(),
            name: req.body.name,
            quantity: req.body.quantity,
            location: req.body.location
        };
        
        tools.push(newTool);
        await writeTools(tools);
        res.status(201).json(newTool);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/tools/:id', async (req, res) => {
    try {
        const tools = await readTools();
        const tool = tools.find(t => t.id === req.params.id);
        if (tool) {
            res.json(tool);
        } else {
            res.status(404).json({ message: 'Tool not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/tools/:id', async (req, res) => {
    try {
        const tools = await readTools();
        const index = tools.findIndex(t => t.id === req.params.id);
        
        if (index !== -1) {
            tools[index] = {
                ...tools[index],
                name: req.body.name,
                quantity: req.body.quantity,
                location: req.body.location
            };
            
            await writeTools(tools);
            res.json(tools[index]);
        } else {
            res.status(404).json({ message: 'Tool not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/tools/:id', async (req, res) => {
    try {
        const tools = await readTools();
        const filteredTools = tools.filter(t => t.id !== req.params.id);
        
        if (tools.length !== filteredTools.length) {
            await writeTools(filteredTools);
            res.json({ message: 'Tool deleted' });
        } else {
            res.status(404).json({ message: 'Tool not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});