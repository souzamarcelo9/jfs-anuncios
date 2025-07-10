import './ConfirmationScreen.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import db from '../../firebase';
import { addDoc, deleteDoc, doc,getDoc, onSnapshot, updateDoc, } from "firebase/firestore";
import { collection, getDocs, getFirestore,setDoc } from "firebase/firestore";
import { storage } from '../../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import LoadingSpinner from '../../components/LoadingSpinner';
import { useParams } from 'react-router';
import axios from "axios";

const ConfirmationScreen = () => {

  const navigate = useNavigate();
  const params= useParams();
  const [dbProject,setDBProject] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const fetchProjectData = async () => {
           
      //const sectionsCollectionRef = collection(getFirestore(), "projetos"); 
      //let q  = query(sectionsCollectionRef, where('projectID', '==',params.project));
     
        //await getDocs(q)
       // .then((querySnapshot)=>{ 
        //  const newData = querySnapshot.docs
        //.map((doc) => ({...doc.data(), id:doc.id }));
        //setDBProject(newData); 
        //});              
    }

  const handleGenerateProject = async () => {
    // Handle project generation logic
    
    let projectId = params.project;

    console.log("Generating project...");
     
    setIsSaving(true);
    setSaveError(null);

    try 
    {

    //await fetch(`http://localhost:3001/gerar-audio-unico/${projectId}`);

    const response = await fetch(`http://localhost:3001/gerar-video/${projectId}`);
    let data = await response.json();

    alert(data.mensagem);
    console.log("Caminho do vídeo gerado:", data.caminho);
    } 
    catch (err) 
    {
    console.error(err);
    alert(err);
    }
    finally{
      setIsSaving(false);
      navigate('/dashboard'); // Uncomment if you need to navigate after generation
   }        
    
  };

   useEffect(()=>{
 
    //fetchProjectData();
    
  }, [])

  return (
    <div className="product-app-container">
    <div className="confirmation-screen">
      <div className="confirmation-container">
        <div className="confirmation-icon">
          <svg viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        </div>
        
        <h1 className="confirmation-title">Tudo pronto!</h1>
        <p className="confirmation-message">
          Você já pode gerar seu projeto completo com todas as configurações que definiu.
        </p>
        
        <button 
          onClick={handleGenerateProject}
          className="generate-button"
        >
          Gerar Projeto Completo
        </button>

        {isSaving && <LoadingSpinner />}
        
        <p className="confirmation-note">
          Você pode visualizar seus vídeos na área de dashboard.
        </p>
        
        <button 
          /* onClick={() => navigate(-1)}
          className="back-link" */

          onClick={() => navigate("/dashboard")}
          className="back-link"
        >
          Voltar para o dashboard
        </button>
      </div>
    </div>
    </div>
  );
};

export default ConfirmationScreen;