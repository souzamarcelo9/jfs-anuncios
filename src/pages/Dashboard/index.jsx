import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from 'react-router-dom';
import db from '../../firebase';
import { addDoc, deleteDoc, doc,getDoc, onSnapshot, updateDoc,query,where } from "firebase/firestore";
import { collection, getDocs, getFirestore,setDoc } from "firebase/firestore";
import { storage } from '../../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import LoadingSpinner from '../../components/LoadingSpinner';
import { useParams } from 'react-router';
import axios from "axios";
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import Sidebar from '../../components/Sidebar/Sidebar';

// 🎯 Simulação de dados
/* const mockVideos = [
  { id: "1", title: "Mega Ofertas 01", url: "/videos/project123/video-final.mp4" },
  { id: "2", title: "Mega Ofertas 02", url: "/videos/project456/video-final.mp4" },
]; */

const DashboardContainer = styled.main`
  min-height: 100vh;
  background: linear-gradient(to bottom, #304775, #5b646e);
  color: white;
  padding: 2rem;
  font-family: Arial, sans-serif;
`;

const CreateButton = styled.button`
  background: #ff9800;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  margin: 2rem auto 0 auto;
  display: block;

  &:hover {
    background: #fb8c00;
  }
`;

const Heading = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
`;

const StatTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
`;

const StatValue = styled.p`
  font-size: 1.5rem;
  margin: 0;
`;

const StatText = styled.p`
  font-size: 1.0rem;
  margin: 0;
`;

const VideoList = styled.ul`
  list-style: none;
  padding: 0;
`;

const VideoItem = styled.li`
  display: flex;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 0.5rem;
  padding: 1rem;
  border-radius: 6px;
`;

const DownloadButton = styled.a`
  background: #00c853;
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  &:hover {
    background: #00e676;
  }
`;

export default function Dashboard() {

  const [videos, setVideos] = useState([]);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const userDB = location.state;
  const { currentUser, logOut } = useAuth();
  const dataAtual = new Date();

  // Formato completo brasileiro: DD/MM/AAAA HH:MM:SS
const dataHoraBrasil = dataAtual.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // Para usar formato 24 horas
});

  const getVideosFromUser = async () => {
     //  busca de vídeos do backend
    const sectionsCollectionRef = collection(getFirestore(), "videos"); 
      let q  = query(sectionsCollectionRef, where('userId', '==',currentUser.email));
     
        await getDocs(q)
       .then((querySnapshot)=>{ 
          const newData = querySnapshot.docs
        .map((doc) => ({...doc.data(), id:doc.id }));
        setVideos(newData); 
        });    
    
    setUsername(currentUser.username);
  }

  useEffect(() => {
   
    getVideosFromUser();
  }, [videos]);

  return (
    <>
    {/* <Sidebar /> */}
    <DashboardContainer>
      <Heading>👋Bem-vindo - {dataHoraBrasil}</Heading>

      <Section>
        <h2>📊 Estatísticas</h2>
        <StatsGrid>
          <StatCard>
            <StatTitle>Vídeos Gerados</StatTitle>
            <StatValue>{videos.length}</StatValue>
          </StatCard>
          <StatCard>
            <StatTitle>Downloads</StatTitle>
            <StatValue>{videos.length * 2}</StatValue>
          </StatCard>
          <StatCard>
            <StatTitle>Último Projeto</StatTitle>
            <StatText>{videos[0]?.projectName || "-"}</StatText>
          </StatCard>
        </StatsGrid>
      </Section>

      <Section>
        <h2>📂 Meus Vídeos</h2>
        <VideoList>
          {videos.map((video) => (
            <VideoItem key={video.id}>
              <span>{video.projectName}</span>
              <DownloadButton href={video.videoUrl} download>
                ⬇️ Download
              </DownloadButton>
            </VideoItem>
          ))}
        </VideoList>

        <CreateButton onClick={() => navigate('/promptModeler')}>
            Crie seu anúncio
        </CreateButton>
    </Section>
    </DashboardContainer>
    </>
  );
}