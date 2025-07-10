import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import './ProductForm.css';
import { v4 as uuidv4 } from 'uuid';
import db from '../../firebase';
import { addDoc, deleteDoc, doc,getDoc, onSnapshot, updateDoc, } from "firebase/firestore";
import { collection, getDocs, getFirestore,setDoc } from "firebase/firestore";
import { storage } from '../../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import LoadingSpinner from '../../components/LoadingSpinner';
import extenso from "extenso";

const ProductForm = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [projectID,setProjectID] = useState(uuidv4());
  const [projectName,setProjectName] = useState("");
  const [imageUpload, setImageUpload] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [txtDsc,setDescription] = useState("");
  const [txtPreco,setPreco] = useState(Number(0));
  const [txtNomeProd,setNomeProd] = useState("");
  const [txtCategory,setCategory] = useState("");
  const [txtQuantidade,setQuantidade] = useState(Number(0));
  const [posicao,setPosicao] = useState("depois");

  const onSubmit = async (data) => {
    setIsSubmitting(true);    

    const finalDescription = gerarFraseDoProduto(
      data.productName,
      data.price,
      data.category,
      extenso(Number(data.quantidade),{mode:"number"}) || '',
      posicao
    );
    
    // Cria um produto com um ID único
    const newProduct = {
      id: uuidv4(), //  unique ID
      name: data.productName,
      price: parseFloat(data.price).toFixed(2),
      category: data.category,
      //description: txtNomeProd + ',' + txtPreco + ' ' + writeUMText(txtCategory) + ' ' + txtQuantidade,
      description: finalDescription,
      quantidade: data.quantidade || '',
      image: previewImage || null,
      imgFile:imageUpload,
      createdAt: new Date().toISOString()
    };
    
    setProjectName(data.productName);
    // Adiciona no array de produtos
    setProducts(prev => [newProduct, ...prev]);

    //alert(txtNomeProd + ',' + txtPreco + ' ' + writeUMText(txtCategory) + ' ' + txtQuantidade);
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
    reset();
    setPreviewImage(null);
    
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const unidadeMap = {
    ml: "mililitros",
    l: (txtQuantidade > 1 ? "litros" : "litro"),
    kg: "o quilo",
    g: "gramas",
    un: "a unidade",
    pc: "a peça",
  };
  
  function gerarFraseDoProduto(nome, preco, unidade, quantidade, posicao) {
    const precoFloat = parseFloat(preco.replace(/[R$\s]/g, '').replace(',', '.'));
    const precoExtenso = extenso(precoFloat, { mode: 'currency' });
  
    const unidadeExt = unidadeMap[unidade.toLowerCase()] || unidade;
    
    const qtdFinal = quantidade ? `${quantidade} ${unidadeExt}` : unidadeExt;
    let txtQuantidade = qtdFinal;
    console.log(qtdFinal);

    if(qtdFinal.indexOf("zero") !== -1) 
    {
     txtQuantidade = qtdFinal.replace("zero", "");
     txtQuantidade.trim();
    }
    
    if (posicao === "antes") {
      return `${nome}, ${txtQuantidade}, por apenas ${precoExtenso}.`;
    } else {
      return `${nome}, por apenas ${precoExtenso} ${txtQuantidade}.`;
    }
      
  }         

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
     
    setImageUpload(file);

  };

  const removeProduct = (id) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const handleConfigureBranding = () => {
    
    window.location = '/branding/'+ projectID ;
  }

  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image file
    if (!file.type.match('image.*')) {
      alert('Please upload an image file');
      return;
    }

    const updatedItems = [...order.items];
    updatedItems[index] = { 
      ...updatedItems[index], 
      imgFile: file,
      // Show preview while waiting for upload
      imgUrl: URL.createObjectURL(file) 
    };
    setOrder({ ...order, items: updatedItems });
  };

  const uploadImage = async (file, itemId) => {
    if (!file) return null;
    
    const storagePath = `projects/${projectID}/items/${itemId}/${file.name}`;
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

  const writeUMText = (um) => {
     
    var retorno = '';
    
    switch(um){
      case 'ml':
        retorno = 'emeele';
        break;
      
        case 'L':
        retorno = 'o litro';
        break;
        
        case 'kg':
        retorno = 'o kilo';
        break;

        case 'g':
        retorno = 'gramas';
        break;

        case 'un':
        retorno = 'a unidade';
        break;

        case 'pc':
        retorno = 'a peça';
        break;

      default:
        // Código a ser executado se a expressão não corresponder a nenhum dos casos
        
    }

    return retorno;
  }
    

  const handleSave = async (e) => {
    e.preventDefault();
    
    setIsSaving(true);
    setSaveError(null);

    try {
      // Upload das imagens
      const uploadPromises = products.map(item => 
        item.imgFile ? uploadImage(item.imgFile, item.id) : null
      );
      
      const uploadResults = await Promise.all(uploadPromises);

      // Atualiza os items com a url da imagem
      const itemsWithUrls = products.map((item, index) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        description: item.description || '',
        supermarket: item.supermarket || '',
        //image: previewImage || null,
        //imgFile:imageUpload,
        createdAt: new Date().toISOString(),                
        //...item,
        imgUrl: uploadResults[index]?.url || '',
        imgPath: uploadResults[index]?.path || ''
        
      }));

      // Projeto Final 
      
      const projectData = {
        projectID:projectID,
        customerID:'souza.marcelo9@gmail.com',
        name:"Beta Project J.F Anuncios",        
        items: itemsWithUrls,
        createdAt: new Date().toISOString()
      };

      // Salvando no Firestore
      //await collection(getFirestore(), "projects").doc(projectID).set(projectData);
      //await db.collection('projects').doc(projectID).set(projectData);
      const orderRef = doc(collection(getFirestore(), "projects"), projectData.projectID);
    
      // Salva o projeto de supermercado
      await setDoc(orderRef, projectData);
      
      //alert('Project saved successfully!');
      handleConfigureBranding();
    } 
    catch (error) 
    {
      console.error("Erro salvando projeto:", error);
      setSaveError('Erro ao salvar projeto. Tente novamente');
      alert('Erro ao salvar projeto.');
    }
    finally {
      setIsSaving(false);
    }
  };

  const setBilboardText = () => {
    
  }

  return (
    <div className="product-app-container">
      <div className="product-form-container">
        <h1 className="form-title">Passo 1 - Registre seus produtos</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="product-form">
          
          <div className="form-group">
            <label htmlFor="productName">Nome*</label>
            <input
              id="productName"
              type="text"
              {...register("productName", { required: "Nome do produto é obrigatório" })}
              className={`form-input ${errors.productName ? 'error' : ''}`}
              placeholder="e.g. Maçã Gala"
              onChange={(e) => setNomeProd(e.target.value)}
            />
            {errors.productName && (
              <span className="error-message">{errors.productName.message}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Preço*</label>
              <div className="price-input-container">
                <span className="currency-symbol"> {"R$  " + " "}</span>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price", { 
                    required: "Preço é obrigatório",
                    min: { value: 0.01, message: "Preço tem que ser maior do que zero" }
                  })}
                  className={`form-input ${errors.price ? 'error' : ''}`}
                  placeholder={" " + "0.00"}
                  onChange={(e)=> e.target.value.length > 0 ? setPreco(extenso(parseFloat(e.target.value.replace(/[R$\s]/g, '').replace(',', '.')),{ mode: 'currency' })) : console.log(e.target.value) }
                />
              </div>
              {errors.price && (
                <span className="error-message">{errors.price.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="category">Unidade de medida*</label>
              <select
                id="category"
                {...register("category", { required: "Categoria é obrigatória" })}
                className={`form-input ${errors.category ? 'error' : ''}`}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Selecione (kg,L, ml,pc,un)</option>
                <option value="ml">mililitros(ml)</option>
                <option value="L">litros(L)</option>
                <option value="kg">quilos(kg)</option>
                <option value="g">gramas(g)</option>
                <option value="un">unidade(un)</option>
                <option value="pc">peça(pc)</option>
                 
              </select>
              {errors.category && (
                <span className="error-message">{errors.category.message}</span>
              )}
            </div>
            
          </div>

          <div className="form-row">
            <div className="form-group">
            <label htmlFor="quantidade">Adicionar Quantidade (kg,L, ml, ml)</label>
            <input
                  id="quantidade"
                  type="number"
                  step="1"
                  min="1"
                  {...register("quantidade", {                     
                    min: { value: 0.01, message: "Quantidade tem que ser maior do que zero" }
                  })}
                  className={`form-input ${errors.quantidade ? 'error' : ''}`}
                  placeholder={" " + "0"}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div> 
            <div className="form-group">
              <label htmlFor="position">Antes ou depois do valor?</label>
              <select
                id="position"
                className={`form-input ${errors.category ? 'error' : ''}`}
                value={posicao}
                onChange={(e) => setPosicao(e.target.value)}
              >
                <option value="depois">Depois</option>
                <option value="antes">Antes</option>
                                 
              </select>
              {errors.category && (
                <span className="error-message">{errors.category.message}</span>
              )}
            </div>
          </div>
         
          <div className="form-group">
            <label htmlFor="description">Visualização do texto do produto </label>
            <textarea
              id="description"
              /* {...register("description")} */
              className="form-input"
              rows="3"
              placeholder="Exemplo: Alcatra Bovina com Maminha Peça Inteira, trinta e quatro reais e noventa centavos o kilo!!"
              onChange={(e)=> setDescription(e.target.value.toString())}
              value={ txtPreco.length > 0 ? (txtNomeProd + ',' + txtPreco + ' '  + (txtQuantidade > 0 ? txtQuantidade : '')  + ' ' + writeUMText(txtCategory))                                                               
                                                           : txtNomeProd + writeUMText(txtCategory) + ' ' +(txtQuantidade > 0 ? txtQuantidade : '').toString() }
              
            />
          </div>
                    

          <div className="form-group">
            <label htmlFor="image">Foto do produto</label>
            <div className="image-upload-container">
              <label className="image-upload-label">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  {...register("image")}
                  onChange={handleImageChange}
                  className="image-upload-input"
                />
                {errors.image && (
                <span className="error-message">{errors.image.message}</span>
              )}
                <span className="upload-button">Escolha a imagem</span>
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="image-preview" />
                ) : (
                  <div className="image-placeholder">
                    <svg viewBox="0 0 24 24" className="placeholder-icon">
                      <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/>
                    </svg>
                    <span>Nenhuma imagem selecionada</span>
                  </div>
                )}
              </label>
            </div>
          </div>
        
          <div className="form-actions">
            <button $primary
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Adicionar na lista de Produtos '}
            </button>
            
            <nbsp>     </nbsp>
            <button
              type="button"
              className="save-button"
              disabled={products.length > 0 ? false : true}
              onClick={handleSave}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar / Avançar para paleta de cores'}
            </button>

            {isSaving && <LoadingSpinner />}
                                    
          </div>

          {submitSuccess && (
            <div className="success-message">
              <svg viewBox="0 0 24 24" className="success-icon">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
              Produto inserido com sucesso!
            </div>
          )}
        </form>
      </div>

      <div className="product-list-container">
        <h2 className="product-list-title">Lista de produtos ({products.length})</h2>
        
        {products.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" className="empty-icon">
              <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm6 10H6v-1.53c0-3.5 3.56-4.33 6-4.33s6 .83 6 4.33V18z"/>
            </svg>
            <p>Nenhum produto inserido</p>
          </div>
        ) : (
          <div className={`product-list ${products.length > 2 ? 'compact-view' : ''}`}>
            {products.map(product => (
              <div key={product.id} className="product-list-item">
                <div className="product-list-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <div className="product-image-placeholder">
                      <svg viewBox="0 0 24 24">
                        <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/>
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="product-list-details">
                  <div className="product-list-header">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-price">R$ {product.price}</div>
                  </div>
                  
                  <div className="product-list-meta">
                    <span className="product-category">{product.category.replace('-', ' ')}</span>
                    {product.barcode && (
                      <span className="product-barcode">SKU: {product.barcode}</span>
                    )}
                  </div>
                  
                  {/* {product.description && (
                    <p className="product-description">{product.description}</p>
                  )} */}
                </div>
                
                <button 
                  onClick={() => removeProduct(product.id)}
                  className="delete-button"
                  aria-label="Delete product"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    
    </div>
  );
};

export default ProductForm;