import React from "react";


export class EnvironmentUtils {
    constructor() {
        this.props = {
            filePath : 'tmp/data.json'
        }
    }

    newEntry(obj) {
        
    }

    updateEntry(obj) {

    }

    deleteEntry(obj) {

    }

    fetch() {
        return fetch('http://localhost:8081/environments')
            .then(response => response.json());
    }

    fetchByName() {

    }

}