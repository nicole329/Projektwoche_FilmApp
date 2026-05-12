import { Card, CardContent, Typography, Button } from '@mui/material';
import OpenAI from "openai";
import { useState } from 'react';

const openai = new OpenAI();

export default function MUICard() {
    
    const [resultHaiku, setResultHaiku] = useState("AI Haiku!");

    function generateHaiku() {
        const response = openai.responses.create({
            model: "gpt-5.4-mini",
            input: "write a haiku about ai",
            store: true,
        });

        response.then((result) => setResultHaiku(result.output_text));
    }

    return (
        <Card sx={{ maxWidth: 345, p: 2 }}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    AI generated Haiku
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {resultHaiku}
                </Typography>
            </CardContent>
            <Button sx={{ mt: 2 }} variant="contained" onClick={() => generateHaiku()}>Generate haiku!</Button>
        </Card>
    );
}