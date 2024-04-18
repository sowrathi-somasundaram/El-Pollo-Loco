'use client';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { ButtonGroup } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material';
import { MuiChipsInput } from 'mui-chips-input'
import { stringify } from 'querystring';
import { title } from 'process';

function PollForm() {

    const [pollData, setPollData] = useState({
        // Need to get current logged in user
        userID:123,
        title: "",
        options: [
            {
                optionID:0,
                optionText:"",
            },
            {
                optionID:0,
                optionText:"",
            }
        ],        
    })

    const pollRef = useRef(pollData);

    const [tags, setTags] = useState<string[]>([]);

    const handleChange = (event: any, fieldName: string, ind:number=0) => {
        const title = event.target.value;
        //alert(title)
        if (fieldName === "title") {
            setPollData(pollData => ({...pollData, title: title}))
        }
        else if (fieldName === "options") {

            const newText = event.target.value;
            pollData.options[ind].optionText = newText;

            setPollData(pollData => ({...pollData, options: pollData.options}));
        }
    }
    
    const handleSubmit = (event: any) => {

        alert("Successfully made poll!" + pollData.title + pollData.options[0].optionText+ pollData.options[1].optionText+tags[0]);
        //POST


    }

    const addOption = () => {
        setPollData(pollData => ({
            ...pollData,
            userID: pollData.userID,
            title: pollData.title,
            options: [...pollData.options, {optionID: 0, optionText: ""}]
        }))
    }

    function removeOption(ind: number) {

        const newOptions = pollData.options.length > 2 ? pollData.options.filter(function(option, index) {
            if(ind == index){
                return false;
            }
            return true;
        }) : pollData.options;

        setPollData(pollData => ({
            ...pollData, 
            options: newOptions}))

    }

    const optionList = pollData.options?.map((option, index) =>
        <React.Fragment>
            <Box flexDirection="row" alignItems="center" justifyContent='center'sx={{color: "black", display:'flex'}}>
                <Typography variant="body1"sx={{}}>
                    Option
                </Typography>
                <TextField 
                    type="text" 
                    name="option"
                    variant="outlined"
                    size="small"
                    multiline
                    rows=""
                    value={option.optionText}
                    sx={{m:1, width: 250}}
                    onChange={(event) => handleChange(event, "options", index)}
                />
                <Button variant="text" onClick={(event) => {removeOption(index)}} sx={{maxWidth:"10px", minWidth:"10px"}}>X</Button>
            </Box>
        </React.Fragment>

    )

    const handleTagChange = (newTags: string) => {
        //need this to be split by whitespace for now, should prolly make it more robust?
        
        setTags([newTags]);
    }

    return(
        <Card style={{width: 360, display: 'flex', justifyContent: 'space-evenly', flexDirection: 'column'}}>
            <CardContent style={{margin: 2}}>
                <form action={handleSubmit} method="POST">
                    
                    <FormControl>
                        <Typography variant="h6" component="div" align="center" sx={{p:1}}>
                        Poll Title
                        <TextField
                            type="text"
                            variant="outlined"
                            size="small"
                            name="title"
                            value={pollData.title}
                            sx={{m:1}}
                            onChange={(event) => handleChange(event, "title")}
                        />
                        </Typography>
                    
                        <Button 
                            onClick={addOption}
                        >
                            Add poll option
                        </Button>
                        
                        <FormGroup>
                        {optionList}
                        </FormGroup>
                        <br/>
                        <Typography variant="body2" color='textSecondary' sx={{}}>
                        Tags
                        </Typography>
                        {/* <MuiChipsInput/> */}
                        <TextField
                            type="text"
                            variant="outlined"
                            size="small"
                            name="tags"
                            sx={{}}
                            onChange={(event) => handleTagChange(event.target.value)}
                        />
                        <br/>

                        <Button 
                            variant="contained"
                            type="submit"
                            sx={{m:2}}
                            
                        >
                            Create
                        </Button>
                    </FormControl>
                </form>
            </CardContent>
        </Card>
    )
}

export default function CreatePoll (){
    console.log("here!");
    return(
       <Box sx={{ minWidth: 375 }}>
            <PollForm/>
        </Box>
    );
}
