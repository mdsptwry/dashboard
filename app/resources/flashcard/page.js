'use client'
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"
import { Box, Button, Card, CardActionArea, 
    CardContent, Container, Dialog, DialogActions, 
    DialogContent, DialogContentText, DialogTitle, 
    Grid, Paper, TextField, Typography, Toolbar, AppBar,
    IconButton, Menu, MenuItem } 
from "@mui/material"
import { collection, getDoc, doc, writeBatch } from "firebase/firestore"
import { useState } from "react"
import { db } from "@/firebase"
import { useRouter } from "next/navigation"
import { Person } from "@mui/icons-material";

export default function Generate(){
    const {isLoaded, isSignedIn, user} = useUser()
    const [flashcards, setFlashcards] = useState([])
    const [flipped, setFlipped] = useState([])
    const [text, setText] = useState('')
    const [name, setName] = useState('')
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const [anchorEl, setAnchorEl] = useState(null);
  
    const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }
    const handleMenuClose = () => {
    setAnchorEl(null);
  }

    const handleSubmit = async () => {
        fetch('/api/flashcards', {
            method: 'POST',
            body: text,
        })
        .then((res) => res.json())
        .then((data) => setFlashcards(data))
    }

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const saveFlashCards = async () => {
        if (!name) {
            alert("Please enter a name")
            return
        }

        const batch = writeBatch(db)
        const userDocRef = doc(collection(db, 'users'), user.id)
        const docSnap = await getDoc(userDocRef)

        if (docSnap.exists()){
            const collections = docSnap.data().flashcards || []
            if (collections.find((f)=>f.name === name)){
                alert("Flashcard collection with the same name already exists")
                return
            } else {
                collections.push({name})
                batch.set(userDocRef, {flashcards:collections}, {merge: true})
            }
        } else {
            batch.set(userDocRef, {flashcards: [{name}]})
        }

        const colRef = collection(userDocRef, name)
        flashcards.forEach((flashcard) => {
            const cardDocRef = doc(colRef)
            batch.set(cardDocRef, flashcard)
        })

        await batch.commit()
        handleClose()
        router.push('/saved/flashcards/collections')
    }

    return(
        <Container maxWidth='100vw' disableGutters>
        <AppBar position="static" >
        <Toolbar sx={{backgroundColor: '#AAFF84', height: 80}}>
          <Box sx={{flexGrow: 1}}>
          <Button color="inherit" href="/">
          <Typography color="black" variant="h6" textTransform="none" href="page.js" style={{flexGrow: 1}} sx={{ml: 2}}>
            StuHub
          </Typography>
          </Button>
          </Box>

          <SignedOut>
            <Box sx={{mx: 2}}>
            <Button color = "inherit"  href="/chat"> 
              {' '}
              <Typography color="black">Chat</Typography>
            </Button>
            <Button color="inherit" href="/resources"> 
              {' '}
              <Typography color="black">Resources</Typography>
            </Button>
            <Button color="inherit" href="/saved"> 
              {' '}
              <Typography color="black">Saved</Typography>
            </Button>
            <Button color="inherit" href="/discover"> 
              {' '}
              <Typography color="black">Discover</Typography>
            </Button>
            </Box>
            <IconButton color="black" onClick={handleMenuOpen} sx={{mr: 2}}>
              <Person/>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}>
                <MenuItem onClick={handleMenuClose} component="a" href="/sign-in">
                Sign In
                </MenuItem>
                <MenuItem onClick={handleMenuClose} component="a" href="/sign-up">
                Sign Up
                </MenuItem>
            </Menu>  
          </SignedOut>
          
          
          <SignedIn>
            <Box sx={{mx: 2}}>
            <Button color = "inherit"  href="/chat"> 
              {' '}
              <Typography color="black">Chat</Typography>
            </Button>
            <Button color="inherit" href="/resources"> 
              {' '}
              <Typography color="black">Resources</Typography>
            </Button>
            <Button color="inherit" href="/saved"> 
              {' '}
              <Typography color="black">Saved</Typography>
            </Button>
            <Button color="inherit" href="/discover"> 
              {' '}
              <Typography color="black">Discover</Typography>
            </Button>
            </Box>
            <UserButton/>
          </SignedIn>
        </Toolbar>
      </AppBar>
        <Container maxWidth='md'>
            <Box
                sx={{
                    mt: 4, mb: 6, display: 'flex', 
                    flexDirection:'column',
                    alignItems:'center'
                }}
            >
                <Typography variant="h4">Generate Flashcards</Typography>
                <Paper sx={{
                    p: 4, width: '100%'
                }}>
                    <TextField 
                        value={text}
                        onChange={(e)=>setText(e.target.value)}
                        label = "Enter your prompt"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        sx={{
                            marginBlock: 2
                        }}
                    />
                    <Button 
                        variant="contained"
                        sx={{ color:"white",
                            backgroundColor:"#212121"}}
                        onClick={handleSubmit}
                        fullWidth
                    >   
                        {' '}
                        Generate
                    </Button>
                </Paper>
            </Box>

            {flashcards.length>0 && (
                <Box sx={{mt: 4}}>
                    <Typography variant="h5">Generated Flashcards</Typography>
                    <Grid container spacing={3}>
                        {flashcards.map((flashcard, index)=> (
                           <Grid item xs={12} sx={6} md={4} key={index}>
                            <Card>
                                <CardActionArea 
                                    onClick={()=>{
                                        handleCardClick(index)
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{
                                          perspective: '100px',
                                          '& > div':{
                                            transition: 'transform 0.6s',
                                            transformStyle: 'preserve-3d',
                                            position: 'relative',
                                            width: '100%',
                                            height: '200px',
                                            boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                                            transform: flipped[index] ? 'rotateY(180deg)': 'rotateY(0deg)'
                                          },
                                          '& > div > div':{
                                            position: 'absolute',
                                            width: '100%',
                                            height: '100%',
                                            backfaceVisibility: 'hidden',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            padding: 2,
                                            boxSizing: 'border-box'
                                        },
                                          '& > div >div:nth-of-type(2)':{
                                            transform: 'rotateY(180deg)',
                                        },

                                        }}>
                                            <div>
                                                <div>
                                                    <Typography 
                                                        variant="h5"
                                                        component={'div'}
                                                    >
                                                        {flashcard.front}
                                                    </Typography>
                                                </div>
                                                <div>
                                                    <Typography 
                                                        variant="h5"
                                                        component={'div'}
                                                    >
                                                        {flashcard.back}
                                                    </Typography>
                                                </div>
                                            </div>

                                        </Box>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                           </Grid>
                        ))}
                    </Grid>
                    <Typography 
                    variant="h6" 
                    textAlign={'center'}
                    sx={{marginTop: 3}}
                    > 
                    {isSignedIn ? (
                            `To save you collection, please make sure you are signed in.
                            Otherwise it will not save.`
                     ): (
                        "You are not Signed in. Please sign in to save your collection."
                     )}
                    </Typography>
                    <Box sx={{
                        mt: 2,
                        mb: 4,
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <Button 
                        variant="contained" 
                        color="secondary"
                        onClick={isSignedIn ? handleOpen: null}
                        disabled={!isSignedIn}
                        >
                        Save Collection
                        </Button>

                    </Box>
                </Box>
            )}

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Save Flashcards</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter a name for your flashcards collection
                    </DialogContentText>
                    <TextField 
                        autoFocus
                        margin="dense"
                        label="Collection name"
                        type="text"
                        fullWidth
                        value={name}
                        onChange={(e)=>setName(e.target.value)}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={saveFlashCards}>Save</Button>
                </DialogActions>
            </Dialog>
        </Container>
        </Container>
    )

}