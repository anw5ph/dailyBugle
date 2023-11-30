const endpoint = {};
endpoint['login'] = 'http://127.0.0.1:8080/api/login';
endpoint['getUserInfo'] = 'http://127.0.0.1:8080/api/login/getUserInfo';
endpoint['getArticles'] = 'http://127.0.0.1:8080/api/articles/';
endpoint['getAds'] = 'http://127.0.0.1:8080/api/ads/';
endpoint['trackAd'] = 'http://127.0.0.1:8080/api/ads/trackAd';
endpoint['getComments'] = 'http://127.0.0.1:8080/api/ads/getComments/';
endpoint['addComment'] = 'http://127.0.0.1:8080/api/ads/addComment';
endpoint['editStory'] = 'http://127.0.0.1:8080/api/articles/';

// var isAuthor = false;
  
// Function to check if the provided username and password match a record in the database
async function authenticateUser(inputUsername, inputPassword) {

    let hashedPassword = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(inputPassword))
    .then(hash => {
        const hashArray = Array.from(new Uint8Array(hash));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

        return hashHex;
    });

    let data = {
        username: inputUsername,
        password: hashedPassword
    };

    let response = await fetch(endpoint['login'], {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then( response => response.json())
    .then ( (result) => {
        return result;
    })
    .catch( error => console.error(error));

    console.log(response);

    if (response['auth'] == 'Authenticated') {
        await createCookie("auth-cookie", response['sessionID']);
        return true;
    }
    else {
        return false;
    }
}

function createCookie(name, value) {
    const encodedName = encodeURIComponent(name);
    const encodedValue = encodeURIComponent(value);

    let cookieString = encodedName + "=" + encodedValue;
    document.cookie = cookieString;
}

async function getUsername() {
    let cookie = document.cookie;
    let cookieArray = cookie.split(';');

    let usernameElement = document.getElementById('username');

    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }

        if (cookie.indexOf("auth-cookie") == 0) {
            let data = {sessionID: cookie.substring("auth-cookie=".length, cookie.length)};

            let response = await fetch(endpoint['getUserInfo'], {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then( response => response.json())
            .then ( (result) => {
                return result;
            })
            .catch( error => console.error(error));
        
            console.log(response);
            usernameElement.innerHTML = response['username'];

            if (response['role'] == 'author') {
                document.querySelector('.author-container').style.display = 'block';
                document.querySelector('.reader-container').style.display = 'none';

            }
            else if (response['role'] == 'reader'){
                document.querySelector('.author-container').style.display = 'none';
                document.querySelector('.reader-container').style.display = 'block';
            }
        }
    }

}

async function getArticles() {
    let response = await fetch(endpoint['getArticles'])
    .then( response => response.json())
    .then ( (result) => {
        return result;
    })
    .catch( error => console.error(error));

    console.log(response);

    let articles = response['articles'];
    
    let article = articles[0];
    console.log(article)
    console.log(article.title)
    storyContainer = document.getElementById('story-container');
    let articleElement = document.createElement('div');
    articleElement.classList.add('article');
        articleElement.innerHTML = `
            <div class="article-title"><h3>${article.title}</h3></div>
            <div class="article-body">${article.body}</div>
        `;
        
    storyContainer.appendChild(articleElement);

    let teaserContainer = document.querySelector('.teaser-container');
    for (let i = 1; i < articles.length; i++) {
        let article = articles[i];
        let articleTitle = document.createElement('h3');
        articleTitle.innerHTML = `
            ${article.title}`;
        teaserContainer.appendChild(articleTitle);

        let articleTeaser = document.createElement('div');
        articleTeaser.classList.add('teaser');
        articleTeaser.innerHTML = `
            <p>${article.teaser}<p>`;
        teaserContainer.appendChild(articleTeaser);
    }

}

async function getAds() {
    let response = await fetch(endpoint['getAds'])
    .then( response => response.json())
    .then ( (result) => {
        return result;
    })
    .catch( error => console.error(error));

    console.log(response);
    let ads = response['ads'];

    let ad = ads[0];
    let adContainer = document.querySelector('.ad-container');
    adContainer.id = ad._id.toString();
    let adElement = document.createElement('div');
    adElement.classList.add('ad');
    adElement.innerHTML = `
            <div class="ad-title">${ad.advertisement}</div>
        `;
    adContainer.appendChild(adElement);

}

async function trackAd(isClick, isAnonymous) {
    const currentDateTime = new Date();
    let adContainer = document.querySelector('.ad-container');

    let eventType = 'view';
    if (isClick == true) {
        eventType = 'click';
    }

    let articleID = null;
    if (isAnonymous == false) {
        let storyContainer = document.querySelector('.story-container');
        articleID = storyContainer.id;
    }


    let data = {
        date: currentDateTime.toLocaleString(),
        adID: adContainer.id,
        userIP: '127.0.0.1',
        userAgent: navigator.userAgent,
        eventType: eventType,
        articleID: articleID,
    };

    let response = await fetch(endpoint['trackAd'], {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then( response => response.json())
    .then ( (result) => {
        return result;
    })
    .catch( error => console.error(error));

    console.log(response);

}

async function getCurrentStory() {
    let response = await fetch(endpoint['getArticles'])
    .then( response => response.json())
    .then ( (result) => {
        return result;
    })
    .catch( error => console.error(error));

    console.log(response);

    let articles = response['articles'];
    
    let article = articles[0];
    let storyContainer = document.querySelector('.story-container');
    storyContainer.id = article._id.toString();
    let articleElement = document.createElement('div');
    articleElement.classList.add('article');
        articleElement.innerHTML = `
            <div class="article-title"><h3>${article.title}</h3></div>
            <div class="article-info">${article.date} | ${article.categories}</div>
            <hr>
            <div class="article-body">${article.body}</div>
        `;
        
    storyContainer.appendChild(articleElement);

}

async function getComments() {

    const currentArticle = document.querySelector('.story-container');
    data = {articleID: currentArticle.id};

    let response = await fetch(endpoint['getComments'], {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then( response => response.json())
    .then ( (result) => {
        return result;
    })
    .catch( error => console.error(error));

    console.log(response);
    let comments = response['comments'];

    let commentsContainer = document.querySelector('.comment');
    for (let i = 0; i < comments.length; i++) {
        console.log(comments[i]);
        let comment = comments[i];
        let commentBody = document.createElement('div');
        commentBody.classList.add('individual-comment');
        if (i == comments.length - 1) {
            commentBody.innerHTML = `
            <p>${comment.userID} | ${comment.comment} (${comment.date})<p>
            `
            ;

        }
        else {
            commentBody.innerHTML = `
            <p>${comment.userID} | ${comment.comment} (${comment.date})<p>
            <br><hr><br>`
            ;
        }
        commentsContainer.appendChild(commentBody);
    }

}

async function addComment() {

    const currentDateTime = new Date();
    let storyContainer = document.querySelector('.story-container');
    let articleID = storyContainer.id;
    let commentValue = document.getElementById('comment-input').value;
    let username = document.getElementById('username').innerHTML;

    let data = {
        date: currentDateTime.toLocaleString(),
        comment: commentValue,
        articleID: articleID,
        userID: username
    };

    let response = await fetch(endpoint['addComment'], {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then( response => response.json())
    .then ( (result) => {
        return result;
    })
    .catch( error => console.error(error));

    console.log(response);

}

async function getEditStory() {
    let response = await fetch(endpoint['getArticles'])
    .then( response => response.json())
    .then ( (result) => {
        return result;
    })
    .catch( error => console.error(error));

    console.log(response);

    let articles = response['articles'];
    
    let article = articles[0];

    let storyContainer = document.querySelector('.edit-story');
    storyContainer.id = article._id.toString();
    let articleElement = document.createElement('input');
    articleElement.classList.add('story-input');
    articleElement.value = article.body;
    storyContainer.appendChild(articleElement);

    let teaseContainer = document.querySelector('.tease');
    teaseContainer.id = article._id.toString();
    let teaseElement = document.createElement('input');
    teaseElement.classList.add('teaser-input');
    teaseElement.value = article.teaser;
    teaseContainer.appendChild(teaseElement);

    let categoryContainer = document.querySelector('.category');
    categoryContainer.id = article._id.toString();
    let categoryElement = document.createElement('input');
    categoryElement.classList.add('category-input');
    categoryElement.value = article.categories;
    categoryContainer.appendChild(categoryElement);

    let titleContainer = document.querySelector('.title');
    titleContainer.id = article._id.toString();
    let titleElement = document.createElement('input');
    titleElement.classList.add('title-input');
    titleElement.value = article.title;
    titleContainer.appendChild(titleElement);

}

async function editStory() {
    
        let storyContainer = document.querySelector('.edit-story');
        let articleID = storyContainer.id;
        let storyValue = document.querySelector('.story-input').value;
        let teaseValue = document.querySelector('.teaser-input').value;
        let categoryValue = document.querySelector('.category-input').value;
        let categoriesList = categoryValue.split(',');
        let titleValue = document.querySelector('.title-input').value;
    
        let data = {
            articleID: articleID,
            body: storyValue,
            teaser: teaseValue,
            categories: categoriesList,
            title: titleValue
        };

        console.log(data);
    
        let response = await fetch(endpoint['editStory'], {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then( response => response.json())
        .then ( (result) => {
            return result;
        })
        .catch( error => console.error(error));
    
        console.log(response);
    
    
}

async function main() {
    await getUsername(); 
    await getCurrentStory(); 
    await getAds(); 
    await trackAd(false, false);
    await getComments();
    await getEditStory();
}