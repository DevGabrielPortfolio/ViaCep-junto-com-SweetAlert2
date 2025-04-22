const formatarDataHora = ()=>{
    const agora = new Date();
    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

    const dia = agora.getDate().toString().padStart(2, 0);
    const mes = (agora.getMonth() + 1).toString().padStart(2, 0);
    const ano = agora.getFullYear();
    const diaSemana = diasSemana[agora.getDay()];

    const hora = agora.getHours().toString().padStart(2, 0);
    const minutos = agora.getMinutes().toString().padStart(2, 0);
    const segundos = agora.getSeconds().toString().padStart(2, 0);

    return `${diaSemana}, ${dia}/${mes}/${ano} ${hora}:${minutos}:${segundos}`;
}

const atualizarHeader = () =>{
    document.querySelector('.header__datetime').textContent = formatarDataHora();
}


setInterval(atualizarHeader, 1000);

atualizarHeader();


const form = document.querySelector('#consultaForm');
const ufInput = document.querySelector('#uf');
const cidadeInput = document.querySelector('#cidade');
const logradouroInput = document.querySelector('#logradouro');
const resultContainer = document.querySelector('#result');

// Adicionar evento de SUBMIT ao formulário de consulta
// ASYNC = Consulta assincrona, ou seja, espera a API responder para depois trazer e construir
form.addEventListener('submit', async (event) =>{

    // Impedir que o formulário tenha seu comportamento padrão
    event.preventDefault();

    // Capturar valores dos campos do formulário e remover espaços
    const uf = ufInput.value;
    const cidade = cidadeInput.value.trim();
    // TRIM = remove os espaços no começo e no final de uma palavra, ou seja, remove apenas os espaços "em branco" -> inuteis
    const logradouro = logradouroInput.value.trim();

    // Validação dos campos do formulario
    // Verificar se um estado foi selecionado
    if(uf===''){
        // AWAIT = espera o evento ASYNC
        await Swal.fire({
            icon: 'error',
            title: 'Campo Obrigatório',
            text: 'Por Favor, selecione um estado.',
            confirmButtonColor: '#117000'
        });
        return;
    }
    // Verificar se a cidade tem pelo menos 3 caracteres
    if(cidade.length < 3){
        // AWAIT = espera o evento ASYNC
        await Swal.fire({
            icon: 'error',
            title: 'Campo Inválido',
            text: 'Cidade deve ter pelo menos 3 caracteres.',
            confirmButtonColor: '#117000'
        });
        return;
    }
    // Verificar se o logradouro tem pelo menos 3 caracteres
    if(logradouro.length < 3){
        // AWAIT = espera o evento ASYNC
        await Swal.fire({
            icon: 'error',
            title: 'Campo Inválido',
            text: 'Logradouro deve ter pelo menos 3 caracteres.',
            confirmButtonColor: '#117000'
        });
        return;
    }
    
    try{
        // Exibir indicador de carregamento durante
        Swal.fire({
            title: 'Consultando endereço...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Construir UTL da API ViaCep com os parâmetros codificados
        // Codificar cidade e logradouro para evitar problemas com caracteres especiais
        const cidadeEncoded = encodeURIComponent(cidade);
        const logradouroEncoded = encodeURIComponent(logradouro);
        const url = `https://viacep.com.br/ws/${uf}/${cidadeEncoded}/${logradouroEncoded}/json/`;

        // Realizar consulta à API ViaCep e aguardar resposta
        // AWAIT = espera pois esta sendo usando uma função assíncrona
        const data = await consultaViaCep(url);

        // Fechar indicador de carregamento após receber resposta
        Swal.close();

        // Limpar resultados anteriores
        resultContainer.innerHTML = '';

        // Verificar se a consulta retornou resultado
        if(data && data.length > 0){
            // Criar tabela para exibir os resultados da consulta
            const table = document.createElement('table');
            table.className = 'results__table';

            // Criar cabeçalho da tabela (thead)
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');

            // Definir as colunas que serão exibidas na tabela
            const headers = ['CEP', 'Logradouro', 'Bairro'];
            // Criar células do cabeçalho para cada coluna
            headers.forEach(headerText =>{

                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);

            });

            // Adiciona linha de cabeçalho ao thead
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Criar corpo da tabela (tbody) para os dados
            const tbody = document.createElement('tbody');
            // **********Criação da tabela**********

            // **********Popular a tabela**********
            // Interar sobre os elementos retornados da API
            data.forEach(item =>{

                // Criar uma nova linha para cada endereço
                const row = document.createElement('tr');

                // Criar e preencher célula do CEP
                const cellCep = document.createElement('td');
                cellCep.textContent = item.cep;
                row.appendChild(cellCep);

                // Criar e preencher célula do LOGRADOURO
                const cellLogradouro = document.createElement('td');
                cellCep.textContent = item.logradouro;
                row.appendChild(cellLogradouro);

                // Criar e preencher célula do BAIRRO
                const cellBairro = document.createElement('td');
                cellCep.textContent = item.bairro;
                row.appendChild(cellBairro);

                // Adicionar linha completa ao corpo da tabela
                tbody.appendChild(row);

            });

            // Adicionar corpo da tabela e a tabela completa ao container de resultados
            table.appendChild(tbody);
            resultContainer.appendChild(table);

        }else{
            await Swal.fire({
                icon: 'info',
                title: 'Nenhum resultado encontrado',
                text: 'Não foram encontrados endereços com os critérios informados.',
                confirmButtonColor: '#117000'
            });
        }
    }catch(error){
        await Swal.fire({
            icon: 'error',
            title: 'Erro na consulta',
            text: 'Ocorreu um erro ao consultar o endereço. Tente novamente.',
            confirmButtonColor: '#117000'
        });
    }

});

// Adicionar evento de clique ao botão de nova consulta
document.querySelector('#novaConsulta').addEventListener('click', async () => {

    // Limpar formulário e área de resultados
    form.reset();
    resultContainer.innerHTML = '';
    await Swal.fire({

        icon: 'success',
        title: 'Formulário limpo',
        text: 'Você pode realizar uma nova consulta agora.',
        confirmButtonColor: '#117000',
        timer: 4000,
        timerProgressBar: true

    });

});

// Função para realizar consulta à API ViaCep
const consultaViaCep = async (url) => {

    try {

        // Realiza a requisição HTTP GET

    } catch (error) {

        // Propaga o erro para ser tratado pelo
        throw error;
    }

}