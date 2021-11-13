#!/usr/bin/env node

import { Api, ApiImpl, Convert } from "./api"

console.log("haduh")

const api: Api = new ApiImpl(Convert.WEBP)
api.simpleDpi('kucing.jpeg')
api.simpleDpi('desktop.png')

console.log(api.anuan())