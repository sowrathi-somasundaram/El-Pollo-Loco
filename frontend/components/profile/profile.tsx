'use client'
import * as React from 'react';
import { useState, useEffect, useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Grid, Box } from '@mui/material';

import AspectRatio from '@mui/joy/AspectRatio';
import Button from '@mui/material/Button';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';
import IconButton from '@mui/joy/IconButton';
import Textarea from '@mui/joy/Textarea';
import Stack from '@mui/joy/Stack';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Typography from '@mui/joy/Typography';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab, { tabClasses } from '@mui/joy/Tab';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Link from '@mui/joy/Link';
import Card from '@mui/joy/Card';
import CardActions from '@mui/joy/CardActions';
import CardOverflow from '@mui/joy/CardOverflow';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import PollCard from '../discover/pollCard';
import FeedButtons from '../discover/feedButtons';
import { AuthContext } from '@/contexts/authContext';
import CircularProgress from '@mui/material/CircularProgress';


export default function MyProfile() {

  const { push } = useRouter();

  const { isAuth, setAuth } = useContext(AuthContext);
  const [dummyDataChange, setDummyDataChange]= useState([])
  const [loading, setLoading] = useState(true);
  const [followedTags, setFollowedTags] = useState<string[]>(localStorage.getItem('tags') ? localStorage.getItem('tags')?.split(",") : []);
  const [pollsVoted, setPollsVoted] = useState<{poll_id: number, option_id: number}[]>([]);
  const [totalPollsVoted, setTotalPollsVoted] = useState<number>(0);
  const [pollData, setPollData] = useState([]);
  const [userData, setUserData] = useState<{
    username: string,
    user_id: number,
    email: string,
  }>([]);

  useMemo(() => localStorage.getItem("pollsVoted") != null ? setTotalPollsVoted(JSON.parse(localStorage.getItem("pollsVoted")).length) : 0, []);
  
  async function getPolls() {
    // try{
      setFollowedTags(localStorage.getItem('tags') != null ? localStorage.getItem('tags')?.split(",") : []);
      let response = await fetch(`${process.env.BACKEND_URL}/feed/user/1`, {
        method: 'GET',
        credentials: 'include'
      });
      let data = await response.json();
      if (response.ok) {
        //alert(JSON.stringify(data));

        // Directly pass in the list of poll ids - can't use states
        // since they aren't set until the function exits
        await getVoted(data.map((poll: any) => {
          return poll.poll_id;
        }));

        setPollData(data);

        // Once we've successfully fetched the user info, load page components
        // Doing it like this because the username needs to be ready before we load
        // but polls don't necessarily have to be there right away
        if(userData.username != "")
          setLoading(false);
      }
      else{

      }
    // }
    // catch (error){
    //   push('auth/login')
    // }
  }

  async function getUser() {
    try{
      let response = await fetch(`${process.env.BACKEND_URL}/auth/profile`, {
        method: 'GET',
        credentials: 'include'
      });
      let data = await response.json();
      if (response.ok) {
        // alert(JSON.stringify(data));
        setUserData(data);
        // setLoading(false);
      }
      else{
        // alert(JSON.stringify(data));

      }
    }
    catch (error){
      push('auth/login')
    }
  }

  useEffect(() => {
  
    getPolls();
    getUser();
  }, []);

   // Pass it the list of poll ids of 6 polls that were just fetched
   async function getVoted(polls: any) {
    try{
      let response = await fetch(`${process.env.BACKEND_URL}/polls/vote/voted`, {
        method: 'GET',
        credentials: 'include'
      });
      let data = await response.json();
      if (response.ok) {
        
        // Filter out any polls that the user voted on that aren't in this batch of
        // polls
        // May need to alter this approach or even have another state that holds
        // this filtered list while keeping the original complete list. Otherwise
        // we have to keep fetching the complete list every time more polls are
        // loaded w/ infinite scroll
        localStorage.setItem('pollsVoted', JSON.stringify(data));
        setPollsVoted(data.filter((poll: any) => polls.includes(poll.poll_id)));
      }
      else{
        setPollsVoted([{poll_id: -1, option_id: -1}]);
      }
    }
    catch (error) {

      setPollsVoted([{poll_id: -1, option_id: -1}]);
    }
  }

  // Needed a way to directly pass the "voted" state into PollCard
  function wasVotedOn(poll_id: number){
    // See if the poll with poll_id was voted on by comparing to pollsVoted list
    let index = pollsVoted.findIndex((poll) => poll.poll_id === poll_id);
    let voted = index > -1 ? pollsVoted[index] : {poll_id: poll_id, option_id: -1};
    return voted;
  }

  function FormRow(pollData: any) {

    // Not the state pollData, but a parameter that contains 1 or 2 polls
    let row = [];

    for (let i = 0; i < pollData.length; i++) {
      // We can't pop off polls from the list since they need to stay in memory to rerender
      // If we needed to remove a poll for any reason, we would use setPollData with pollData.filter
      let currCard = pollData[i];
      let loaded = true;
      // alert(currCard.tags);

      row.push(
        <Grid item xs={5} style={{ padding: 50 }} key={i}>
          {PollCard(
            {setDummyDataChange},
            currCard,
            wasVotedOn(currCard.poll_id),
            followedTags,
            false
          )}
        </Grid>,
      );
    }

    return <React.Fragment>{row}</React.Fragment>;
  }

  function CardsTogether() {
    const rows = 3;
    const cols = 2;
    let grid = [];

    if (pollData.length > 0){
      for (let i = 0; i < rows; i++) {
        grid.push(
          <Grid container item spacing={1} justifyContent="space-around" key={i}>
            {/* Give FormRow 2 polls (or 1 if there's only 1 left) at a time to form the row */}
            {FormRow(pollData?.slice(i * cols, i * cols + cols))}
          </Grid>
          );
      }
    
  
    return (
      <React.Fragment>
        <Grid container spacing={1} sx={{display:"flex", justifyContent:"center"}}>
          {grid}
        </Grid>
      </React.Fragment>
    );
    } 

    else if(pollData.length == 0 && !loading){

      return <Typography level="body-sm">You haven't made any polls yet. Click the "Create Poll" button to get started!</Typography>

    }

    else if (loading){
      return(
      <Box display="flex" justifyContent="center">
          <CircularProgress></CircularProgress>
        </Box>
      )
    }
  }

  function getTotalVotes(){

    let votes = 0;
    pollData?.map((poll) => {
      votes += poll?.options?.map((opt) => opt.vote_count).reduce((partialSum: any, a: any) => partialSum + a, 0);
    });

    return votes;
  }

  function tagList(){

    return(
    <Box sx={{mb:0.5, width:"490px", height:"min-content", color: 'blue', display: 'flex', alignItems:"center", alignContent:"center", flexWrap:"wrap"}}>

      {followedTags?.map((tag) => {
          return(
          <Button onClick={(event) => {    
          }} size="small" variant="contained" style={{fontSize: '11px', textTransform:'uppercase'}} sx={{bgcolor:"green", color:'white', mx:1, my:0.6, maxHeight:"45%"}} key={tag}>{tag} ✓</Button>
        )})}
        </Box>
    )
  }

  return (loading? <Box display="flex" justifyContent="center">
  <CircularProgress></CircularProgress>
</Box>:
    <Box sx={{ flex: 1, width: '100%' }}>
      <Box
        sx={{
          position: 'sticky',
          top: { sm: -100, md: -110 },
          bgcolor: 'background.body',
          zIndex: 9995,
        }}
      >
        
        
      </Box>
      <Stack
        spacing={4}
        sx={{
          display: 'flex',
          maxWidth: '1000px',
          mx: 'auto',
          px: { xs: 2, md: 6 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Box sx={{ }}>
            <Typography level="title-md">{userData.username}'s Profile Page</Typography>
          </Box>          
          <Stack
            direction="row"
            spacing={3}
            sx={{ display: { xs: 'none', md: 'flex' }, my: 0 }}
          >
            
            
          </Stack>
          
        <Box sx={{display:"flex", flexDirection:"row", alignItems:"baseline", alignContente:"baseline", justifyContent: "center"}}>
        
          {/* <Stack direction="row" spacing={3} sx={{display:"flex", width:"100%", alignSelf:"center", alignContent:"baseline", alignItems:"baseline"}}> */}
            <Card sx={{minWidth: "40%", minHeight: "150px", display: "flex", flexDirection: "column", m:2}}>
              
              <Typography level="title-md">Poll Stats</Typography>
              <CardOverflow sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            
            </CardOverflow>
    
              <List sx={{display: "flex", flexDirection: "column"}}>
                <ListItem disablePadding>
                  <Typography>{pollData.length} polls created</Typography>
                </ListItem>
                <ListItem disablePadding>
                  <Typography>{getTotalVotes()} total votes on their polls</Typography>
                </ListItem>
                <ListItem disablePadding>
                  <Typography>Voted {totalPollsVoted} total times</Typography>
                </ListItem>


              </List>
        
            </Card>

            <Card sx={{minWidth: "40%", minHeight: "150px", display: "flex", flexDirection: "column", m:2}}>
              <Typography level="title-md">Followed Tags</Typography>
              <CardOverflow sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            </CardOverflow>
              {tagList()}
            </Card>
          {/* </Stack> */}

        </Box>
        
        <Card sx={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
        <Typography level="title-md">Polls</Typography>

        
        <CardOverflow sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
          
        </CardOverflow>

        <CardsTogether /> 
          
        </Card>
      </Stack>
    </Box>
  );
}