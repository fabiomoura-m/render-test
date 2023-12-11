require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const Note = require('./models/note');

app.use(express.static('dist'));
app.use(express.json());
app.use(cors());

const generateId = () => {
    const maxId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) : 0;
    return maxId + 1;
};

app.get('/', (request, response) => {
    response.send('<h1>Hello World!!</h1>');
});

app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes);
    });
});

app.get('/api/notes/:id', (request, response, next) => {
    const id = request.params.id;

    Note.findById(id)
        .then(note => {
            if (note) {
                response.json(note);
            } else {
                response.status(404).end();
            }
        })
        .catch(error => next(error));
});

app.delete('/api/notes/:id', (request, response, next) => {
    const id = request.params.id;
    Note.findByIdAndDelete(id)
        .then(result => {
            response.status(204).end();
        })
        .catch(error => next(error));
});

app.post('/api/notes', (request, response) => {
    const body = request.body;

    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        });
    }

    const note = new Note({
        content: body.content,
        important: body.important || false
    });

    note.save().then(savedNote => {
        response.json(savedNote);
    });
});

app.put('/api/notes/:id', (request, response, next) => {
    const body = request.body;
    const id = request.params.id;

    const note = {
        content: body.content,
        important: body.important
    };

    Note.findByIdAndUpdate(id, note, { new: true })
        .then(updatedNote => {
            response.json(updatedNote);
        })
        .catch(error => next(error));
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};

// gerenciador de requisições com endpoint desconhecido
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
    console.error(error.message);

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' });
    }

    next(error);
};

// Este deve ser o último middleware a ser carregado.
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
