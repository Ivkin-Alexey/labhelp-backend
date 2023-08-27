module.exports = {
    apps: [{
        name: "my_app",
        script: "index.js"
    }],
    deploy: {
        // "production" is the environment name
        production: {
            // SSH key path, default to $HOME/.ssh
            key: "/path/to/some.pem",
            // SSH user
            user: "ubuntu",
            // SSH host
            host: ["92.53.101.85"],
            // SSH options with no command-line flag, see 'man ssh'
            // can be either a single string or an array of strings
            ssh_options: "StrictHostKeyChecking=no",
            // GIT remote/branch
            ref: "origin/master",
            repo: "git@github.com:Ivkin-Alexey/tg-bot-sc-mp-web-app.git",
            // path in the server
            path: "/var/www/my-repository",
        },
    }
}