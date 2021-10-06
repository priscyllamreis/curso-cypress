/// <reference types="cypress" />
import contrato from '../contracts/produtos.contract'


describe('Teste da funcionalidade produtos', () => {
    let token
    before(() => {
        cy.token('fulano@qa.com', 'teste').then(tkn => { token = tkn })
    });

    it('Deve validar contrato de protudos', () => {
        cy.request('produtos').then(response => {
            return contrato.validateAsync(response.body)
        })
    })

    it('Listar produtos', () => {

        cy.request({
            method: 'GET',
            url: 'Produtos',
        }).then((response) => {
            expect(response.body.produtos[1].nome).to.equal('Samsung 60 polegadas')
            expect(response.status).to.equal(200)
            expect(response.body).to.have.property('produtos')
            expect(response.duration).to.be.lessThan(30)
        })

    });

    it('Cadastrar produto', () => {
        let produto = `Produto novo ${Math.random() * 1000000}`
        cy.request({
            method: 'POST',
            url: 'produtos',
            body: {
                "nome": produto,
                "preco": 200,
                "descricao": "Novo produto",
                "quantidade": 100
            },
            headers: { authorization: token }
        }).then((response) => {
            expect(response.status).to.equal(201)
            expect(response.body.message).to.equal('Cadastro realizado com sucesso')
        })
    })

    it('Deve validar mensagem de erro ao cadastrar produto repetido', () => {
        cy.cadastrarProdutos(token, "Novo produto", 250, "Novo produto", 100)
            .then((response) => {
                expect(response.status).to.equal(400)
                expect(response.body.message).to.equal('Já existe produto com esse nome')
            })
    })
    it('Deve editar um produto já cadastrado', () => {
        cy.request('produtos').then(response => {
            let id = response.body.produtos[0]._id
            cy.request({
                method: 'PUT',
                url: `produtos/${id}`,
                headers: { authorization: token },
                body:
                {
                    "nome": "Produto novo",
                    "preco": 100,
                    "descricao": "Produto editado",
                    "quantidade": 100
                }
            }).then(response => {
                expect(response.body.message).to.equal('Registro alterado com sucesso')
            })
        })

    })

    it('Deve editar um produto ja cadastrado previamente', () => {
        let produto = `Produto novo ${Math.random() * 1000000}`
        cy.cadastrarProdutos(token, produto, 250, "Novo produto", 100)
            .then(response => {
                let id = response.body._id
                cy.request({
                    method: 'PUT',
                    url: `produtos/${id}`,
                    headers: { authorization: token },
                    body:
                    {
                        "nome": produto,
                        "preco": 200,
                        "descricao": "Produto editado",
                        "quantidade": 300
                    }
                }).then(response => {
                    expect(response.body.message).to.equal('Registro alterado com sucesso')
                })
            })
    })

    it.only('Deve deletar um produto previamente ja cadastrado', () => {
        let produto = `Produto novo ${Math.random() * 1000000}`
        cy.cadastrarProdutos(token, produto, 250, "Novo produto", 100)
            .then(response => {
                let id = response.body._id
                cy.request({
                    method: 'DELETE',
                    url: `produtos/${id}`,
                    headers: { authorization: token }
                }).then(response => {
                    expect(response.body.message).to.equal('Registro excluído com sucesso')
                    expect(response.status).to.equal(200)
                })
            })

    })

})
