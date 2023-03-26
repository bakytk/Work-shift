import { describe, it } from "mocha";
import chai from "chai";
import { expect } from 'chai';
import chaiHttp from "chai-http";
import server from "../src/server";
chai.use(chaiHttp);

const agent = chai.request.agent(server);
let ADMIN_TOKEN = "";
let WORKER_ID = "";

before(async () => {
  try {
    let resp = await agent
      .post("/register")
      .set("content-type", "application/json")
      .send({
        username: `Admin-` + (Math.random()*10000),
        password: "1234",
        role: "admin"
      })
    ADMIN_TOKEN = resp.body.access_token;

    resp = await agent
      .post("/register")
      .set("content-type", "application/json")
      .send({
        username: `Worker-` + Math.floor(Math.random() * 10000),
        password: "1234",
        role: "worker"
      })
    WORKER_ID = resp.body.userId;

  } catch (e) {
    console.error(e)
  }

});

describe("CRUD", function() {
  it("CREATE shift", async () => {
    let resp = await agent
      .post("/shift")
      .set("authorization", `Bearer ` + ADMIN_TOKEN)
      .send({
        userId: WORKER_ID,
        timeString: `2023/` + Math.floor(Math.random()*12) +'/'+ Math.floor(Math.random()*30)+ `/0-8`,
      })
    //console.log("CREATE shift resp.body:", resp.body)
    expect(resp).to.have.status(201);
  });

  it("GET shifts", async () => {
    let resp = await agent
      .get("/shifts/" + WORKER_ID)
      .set("authorization", `Bearer ` + ADMIN_TOKEN)
      .send()
    //console.log("GET shifts resp.body:", resp.body)
    expect(resp).to.have.status(200);
  });
});

after( () => {
  agent.close();
});
