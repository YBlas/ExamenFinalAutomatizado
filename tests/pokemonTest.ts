import { TestContext, Step, runScenario, expectNoErrors, expectPath } from "../src";

const API_URL = "http://localhost:4000/graphql";
const ctx = new TestContext();

const steps: Step[] = [
  // --- REGISTER & LOGIN ---
  {
    name: "Register Trainer",
    operation: `
      mutation StartJourney($name: String!, $password: String!) {
        startJourney(name: $name, password: $password)
      }
    `,
    variables: () => ({ name: "Ash", password: "pikachu123" }),
    assert: (res) => expectNoErrors(res),
    after: (res, ctx) => ctx.set("startToken", res.data.startJourney),
    score: 1
  },
  {
    name: "Login Trainer",
    operation: `
      mutation Login($name: String!, $password: String!) {
        login(name: $name, password: $password)
      }
    `,
    variables: () => ({ name: "Ash", password: "pikachu123" }),
    assert: (res) => expectNoErrors(res),
    after: (res, ctx) => ctx.set("token", res.data.login),
    score: 1
  },
  {
    name: "Get Trainer Info (me)",
    operation: `
      query {
        me {
          name
          pokemons { nickname level }
        }
      }
    `,
    assert: (res) => {
      expectNoErrors(res);
      const name = expectPath(res, "me.name");
      if (name !== "Ash") throw new Error("Trainer name mismatch");
    },
    score: 1
  },

  // --- CREATE & CATCH FIRST POKEMON ---
  {
    name: "Create First Pokemon",
    operation: `
      mutation CreatePokemon(
        $name: String!
        $description: String!
        $height: Float!
        $weight: Float!
        $types: [PokemonType!]!
      ) {
        createPokemon(
          name: $name
          description: $description
          height: $height
          weight: $weight
          types: $types
        ) { _id name }
      }
    `,
    variables: () => ({
      name: "Bulbasaur",
      description: "Seed Pokémon",
      height: 0.7,
      weight: 6.9,
      types: ["GRASS", "POISON"]
    }),
    assert: (res, ctx) => {
      expectNoErrors(res);
      ctx.set("firstPokemonId", res.data.createPokemon._id);
    },
    score: 1
  },
  {
    name: "Catch First Pokemon",
    operation: `
      mutation CatchPokemon($pokemonId: ID!, $nickname: String) {
        catchPokemon(pokemonId: $pokemonId, nickname: $nickname) {
          _id
          nickname
          level
        }
      }
    `,
    variables: (ctx) => ({
      pokemonId: ctx.get("firstPokemonId"),
      nickname: "Buddy"
    }),
    assert: (res, ctx) => {
      expectNoErrors(res);
      ctx.set("firstOwnedPokemonId", res.data.catchPokemon._id);
    },
    score: 1
  },

  // --- VERIFY IT IS IN TRAINER'S POKEMONS ---
  {
    name: "Verify First Pokemon In Trainer",
    operation: `
      query {
        me {
          pokemons { nickname _id }
        }
      }
    `,
    assert: (res, ctx) => {
      expectNoErrors(res);
      const pokemons = expectPath(res, "me.pokemons");
      const found = pokemons.find((p: any) => p._id === ctx.get("firstOwnedPokemonId"));
      if (!found) throw new Error("Caught Pokemon not found in trainer's list");
    },
    score: 1
  },

  // --- CREATE 10 MORE POKEMONS (no points) ---
  ...Array.from({ length: 10 }).map((_, i) => ({
    name: `Create Pokemon ${i + 1}`,
    operation: `
      mutation CreatePokemon(
        $name: String!
        $description: String!
        $height: Float!
        $weight: Float!
        $types: [PokemonType!]!
      ) {
        createPokemon(
          name: $name
          description: $description
          height: $height
          weight: $weight
          types: $types
        ) { _id name }
      }
    `,
    variables: () => ({
      name: `Pokemon${i + 1}`,
      description: `Description ${i + 1}`,
      height: 1 + i * 0.1,
      weight: 5 + i,
      types: ["NORMAL"]
    }),
    assert: (res: any) => expectNoErrors(res),
    score: 0
  })),

  // --- LIST ALL POKEMONS ---
  {
    name: "List All Pokemons",
    operation: `
      query {
        pokemons {
          _id
          name
        }
      }
    `,
    assert: (res) => {
      expectNoErrors(res);
      const list = expectPath(res, "pokemons");
      console.log("Total pokemons:", list.length);
    },
    score: 1
  },

  // --- LIST ONLY ONE POKEMON (first one) ---
  {
    name: "List Single Pokemon",
    operation: `
      query($id: ID!) {
        pokemon(id: $id) {
          _id
          name
        }
      }
    `,
    variables: (ctx) => ({ id: ctx.get("firstPokemonId") }),
    assert: (res) => {
      expectNoErrors(res);
      const poke = expectPath(res, "pokemon");
      console.log("Single pokemon:", poke);
    },
    score: 1
  },

  // --- FREE FIRST POKEMON ---
  {
    name: "Free First Pokemon",
    operation: `
      mutation FreePokemon($ownedPokemonId: ID!) {
        freePokemon(ownedPokemonId: $ownedPokemonId) {
          name
          pokemons { _id nickname }
        }
      }
    `,
    variables: (ctx) => ({ ownedPokemonId: ctx.get("firstOwnedPokemonId") }),
    assert: (res, ctx) => {
      expectNoErrors(res);
      const pokemons = expectPath(res, "freePokemon.pokemons");
      if (pokemons.find((p: any) => p._id === ctx.get("firstOwnedPokemonId"))) {
        throw new Error("Pokemon was not freed correctly");
      }
    },
    score: 1
  }
];

// --- RUN SCENARIO WITH SCORING ---
runScenario({ url: API_URL, steps, ctx });
