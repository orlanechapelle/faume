
describe('Tester la barre de recherche sur le site Ami For Ever', function() {

    beforeEach(function () {
        cy.visit('https://forever.amiparis.com/')
                
        //Permet d'intercepter la requête de recherche 
        cy.intercept('GET', '**/api/**/customer/articles?*').as('searchRequest')

        cy.get('button[data-testid="nav.search"]').as('ButtonNav')
        cy.wait(500); // TODO : trouver une meilleure façon de connaitre le fin de chargement de la page
    })
    

    it(`Recherche valide avec un mot-clé`, function() {
        cy.get('@ButtonNav').click()
        cy.get('#input_3').click().type('pantalon')
        cy.wait('@searchRequest').then(function (interception) { 
            cy.get('[data-testid="card.title"]').eq(0).should('contain', 'Pantalon').click()
            cy.get('.f-product-heading > .f-title')
                .should('contain', interception.response.body["hydra:member"][0].title)    
        })
    })

    it('Recherche avec plusieurs mots-clés', function() {
        cy.get('@ButtonNav').click()
        cy.get('#input_3').click().type('pantalon laine') 
        let title;
        cy.wait('@searchRequest').then((interception) => { 
            cy.get('[data-testid="card.title"]').eq(0).should('contain', 'Pantalon').click()
            cy.get('.f-product-heading > .f-title').should('contain', interception.response.body["hydra:member"][0].title)
        //    cy.get(':nth-child(2) > .f-collapse__content > .f-collapse__text').should('contain', 'LAINE')
        })
    })
    /*Lorsque je recherche pantalon laine, j'ai également des pantalons qui ne sont pas en laine dans la recherche. 
    Il semblerait que la recherche soit pantalon OU laine. Or dans ce cas, je recherche pantalon ET laine (les deux éléments font partis de ma recheche)*/

    it('Recherche partielle', function() {
        cy.get('@ButtonNav').click()
        cy.get('#input_3').click().type('pan')  
        cy.wait('@searchRequest').then((interception) => { 
            cy.get('[data-testid="card.title"]').eq(1).should('exist').click()
            cy.get('.f-product-heading > .f-title').should('contain', 'Pantalon')    
        })
    }) 

    it('Recherche avec mot-clé inexsitant', function() {
        cy.get('@ButtonNav').click()
        cy.get('#input_3').click().type('abcdef1234')
        cy.get('.f-form-message').contains('Aucun produit trouvé')
    }) 

    it('Recherche avec accents et caractères spéciaux', function() {
        const specialChars = ['é','è','ç','à']
        cy.get('@ButtonNav').click()
        specialChars.forEach((char) => {
            cy.get('#input_3').click().clear().type(char)
            cy.wait('@searchRequest')
            cy.get('[data-testid="card.title"]').should('exist')
        }) 
    }) 

    it('Recherche avec caractères spéciaux non valides', function() {
        cy.get('@ButtonNav').click()
        cy.get('#input_3').click().type(`'!@#$%^&*()`) 
        cy.get('.f-form-message').contains('Aucun produit trouvé')
    }) 

    it('Recherche avec synonymes', function() {
        cy.get('@ButtonNav').click()

        cy.get('#input_3').click().type('cardigan')
        cy.wait('@searchRequest').then(function ()  {
            cy.get('[data-testid="card.title"]').eq(1).should('exist')

            cy.get('#input_3').click().clear().type('gilet')
            cy.wait('@searchRequest').then(function () {
               cy.get('.f-form-message').contains('Aucun produit trouvé')
                .should('not.exist')
            })
        }) 
    }) 
    // Il semblerait que les mots synonymes ne soient pas pris en compte pour la recherche. 
})

// Axe d'amélioration : permettre d'appuyer sur la touche entrer pour finaliser la recherche avec un redirection sur tous les produits liés à la recherche