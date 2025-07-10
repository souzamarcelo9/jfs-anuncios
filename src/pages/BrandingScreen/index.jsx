import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BrandingScreen.css';
import { useParams } from 'react-router';
import { collection,query, doc ,where,updateDoc, getDocs,getDoc,orderBy, getFirestore, limit,deleteDoc, startAt, endAt } from "firebase/firestore";
import { addDoc, onSnapshot } from "firebase/firestore";
import { storage } from '../../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import LoadingSpinner from '../../components/LoadingSpinner';
import MyToast from '../../components/MyToast';
import bebida from '../../assets/amstel.webp'

const colorPalettes = [
  {
    name: "Vibrante",
    primary: "#0055FF",
    secondary: "#FF0000",
    text: "#e2e6eb",
    bg: "#F8F9FA"
  },
  {
    name: "Natureza",
    primary: "#FFC300",
    secondary: "#7FB800",
    text: "#F0F8FF",
    bg: "#F5F5F0"
  },
  {
    name: "Profissional",
    primary: "#2F4F4F",
    secondary: "#778899",
    text: "#FFFFFF",
    bg: "#E8E8E8"
  },
  {
    name: "Fresco",
    primary: "#7FB800",
    secondary: "#00A6FB",
    text: "#FFFFFF",
    bg: "#F0F8FF"
  },
  {
    name: "Quente",
    primary: "#FF7D00",
    secondary: "#FF2D00",
    text: "#FFFFFF",
    bg: "#FFF5F0"
  },
  {
    name: "Elegante",
    primary: "#5F0F40",
    secondary: "#9A031E",
    text: "#E9F5DB",
    bg: "#F8F0F5"
  }
];

const BrandingScreen = () => {
  const navigate = useNavigate();
  const [selectedPalette, setSelectedPalette] = useState(colorPalettes[0]);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [supermarketName, setSupermarketName] = useState('');
  const [slogan, setSupermarketSlogan] = useState('');
  const params= useParams();
  const [dbProject,setDBProject] = useState([]);
  const [imageUpload, setImageUpload] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  const fetchProjectData = async () => {
         
    const sectionsCollectionRef = collection(getFirestore(), "projetos"); 
    let q  = query(sectionsCollectionRef, where('projectID', '==',params.project));
   
      await getDocs(q)
      .then((querySnapshot)=>{ 
        const newData = querySnapshot.docs
      .map((doc) => ({...doc.data(), id:doc.id }));
      setDBProject(newData); 
      });              
  }


  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(file);
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
    setImageUpload(file);
  };

  const uploadImage = async (file, itemId) => {
    
    if (!file) return null;
    
    const storagePath = `projects/${itemId}/logo/${file.name}`;
    const storageRef = ref(storage,storagePath);
    
    try {
      const snapshot = await uploadBytes(storageRef, file);//await storageRef.put(file);
      const downloadUrl = await getDownloadURL(snapshot.ref);//await snapshot.ref.getDownloadURL();
      return { url: downloadUrl, path: storagePath };
    }
     catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  };

  const handleSaveBranding = async(e) => {

    e.preventDefault();
    var uploadResults = null;    
    var project;

    const brandingConfig = {
      palette: selectedPalette,
      logo: logoPreview,
      supermarketName,
      lastUpdated: new Date().toISOString()
    };
    
    // Save to localStorage or your state management
    localStorage.setItem('brandingConfig', JSON.stringify(brandingConfig));
    
    // Navigate back or to next screen
    //navigate(-1); // Or navigate to your desired route
    
    setIsSaving(true);
    setSaveError(null);

    try 
    {
      // Upload das imagens
    //const uploadPromises = uploadImage(imageUpload, params.project);    
    const uploadResults = await uploadImage(imageUpload, params.project);  //await Promise.all(uploadPromises);
          
    const q = query(collection(getFirestore(), "projects"), where("projectID", "==", params.project));            
    const querySnapshot = await getDocs(q);
    let docID = params.project;
    
    project = doc(getFirestore(), "projects", docID);
           
    // atualiza configurações de branding para finalizar e gerar o vídeo
    await updateDoc(project, {
      smColorSet: selectedPalette,
      logo: logoPreview,
      superMarket:supermarketName,
      slogan,
      smLogo:uploadResults.url,
      smLogoPath:uploadResults.path,
      lastUpdated: new Date().toISOString()
    });

    MyToast('success', 'Projeto salvo com sucesso!', '#61dafb');

    window.location = '/confirmation/'+ docID ;

    
  }catch(error){
    MyToast('error', 'Erro ao salvar projeto de vídeo!', '#a00000');
  }finally {
      setIsSaving(false);
    }
}

  /* useEffect(()=>{
 
    fetchProjectData();
    
  }, [])  */

  return (           
        <div className="branding-screen-container">
          <div className="branding-grid">
            {/* Configuração */}
            <div className="config-column">
              <div className="config-header">
                <h1 className="branding-title">Passo 2 - Configuração da Marca</h1>
                <p className="branding-subtitle">Personalize a identidade visual do seu supermercado e o audio do slogan</p>
              </div>
              
              <div className="config-section">
                <h2>Nome do Supermercado</h2>
                <input
                  type="text"
                  value={supermarketName}
                  onChange={(e) => setSupermarketName(e.target.value)}
                  placeholder="Digite o nome do supermercado"
                  className="supermarket-input"
                />
              </div>

              <div className="config-section">
                <h2>Slogan do supermercado 🔥🔥</h2>
                <textarea
                  type="text"
                  value={slogan}
                  onChange={(e) => setSupermarketSlogan(e.target.value)}
                  placeholder="Slogan - ( Ex: qualidade e economia todo dia é no Bom Preço)"
                  className="supermarket-input"
                  rows="3"
                />
              </div>
              
              <div className="config-section">
                <h2>Paleta de Cores</h2>
                <p>Selecione o esquema de cores para sua marca</p>
                <div className="palette-grid">
                  {colorPalettes.map((palette) => (
                    <div 
                      key={palette.name}
                      className={`palette-option ${selectedPalette.name === palette.name ? 'selected' : ''}`}
                      onClick={() => setSelectedPalette(palette)}
                    >
                      <div className="palette-colors">
                        <div style={{ backgroundColor: palette.primary }}></div>
                        <div style={{ backgroundColor: palette.secondary }}></div>
                        <div style={{ backgroundColor: palette.text }}></div>
                      </div>
                      <span>{palette.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="config-section">
                <h2>Upload do Logo</h2>
                <div className="logo-upload-box">
                  <label className="logo-upload-label">
                    <input type="file" accept="image/*" onChange={handleLogoChange} />
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" />
                    ) : (
                      <div className="upload-instructions">
                        <svg viewBox="0 0 24 24">
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                        <p>Arraste ou clique para enviar</p>
                        <p className="file-requirements">PNG ou JPG (300×100px)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
                            
            </div>
    
            {/* Right Column - Preview */}
            <div className="preview-column">
              <div className="preview-container">
                <h2>Pré-visualização</h2>
                <div className="branding-preview" style={{
                  backgroundColor: selectedPalette.bg,
                  borderColor: selectedPalette.primary
                }}>
                  <div className="preview-header" style={{
                    backgroundColor: selectedPalette.primary,
                    color: selectedPalette.text
                  }}>
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="preview-logo" />
                    ) : (
                      <h3>{supermarketName || "Logo + Produtos"}</h3>
                    )}
                  </div>

                  <div className="product-info">
                        
                        <p className="price"></p>
                        <p className="category"></p>
                      </div>

                  <div className="product-preview">
                      <div className="product-image"> 
                        <img src={bebida} alt="Logo" className="preview-logo" />
                      </div>
                      <div className="product-info">
                        <h4 style={{ color: selectedPalette.primary }}>Produto Exemplo</h4>
                        <p className="price">R$ 9,99</p>
                        <p className="category">Bebidas</p>
                      </div>
                 </div>
                  
                  <div className="preview-body">
                    <div className="promo-banner" style={{
                      backgroundColor: selectedPalette.secondary,
                      color: selectedPalette.text
                    }}>
                      FAIXA SECUNDÁRIA COM LOGO ANIMADA
                    </div>                                        
                  </div>
                </div>
                
                <div className="config-actions">
                <button onClick={() => navigate(-1)} className="back-button">
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveBranding} 
                  className="save-button"
                  style={{
                    backgroundColor: selectedPalette.primary,
                    color: selectedPalette.text
                  }}
                  disabled={!supermarketName}
                >
                  Salvar Configuração
                </button>

                {isSaving && <LoadingSpinner />}
              </div>                                    
              
             

            <p className="confirmation-message">
              
            </p>
             <div>
              <h1 style={{ color: 'red', textAlign: 'center' }}>Dica!!</h1>
              <p className="box-hint">
                Para que seu texto de slogan tenha mais impacto e emoção, considere usar exclamações 
                e o emoji 🔥 no início e no fim do trecho que deseja aumentar a expressão ( você pode copiá-lo no título do campo) . Dessa forma a Inteligência
                Artificial tem uma melhor performance no audio gerado.
              </p>
            </div> 

            </div>
              
            </div>
          </div>
        </div>
    
  );
};

export default BrandingScreen;