import adobeXd from '../app/assets/svg/skills/adobe-xd.svg';
import adobeaudition from '../app/assets/svg/skills/adobeaudition.svg';
import afterEffects from '../app/assets/svg/skills/after-effects.svg';
import angular from '../app/assets/svg/skills/angular.svg';
import aws from '../app/assets/svg/skills/aws.svg';
import azure from '../app/assets/svg/skills/azure.svg';
import blender from '../app/assets/svg/skills/blender.svg';
import bootstrap from '../app/assets/svg/skills/bootstrap.svg';
import bulma from '../app/assets/svg/skills/bulma.svg';
import c from '../app/assets/svg/skills/c.svg';
import canva from '../app/assets/svg/skills/canva.svg';
import capacitorjs from '../app/assets/svg/skills/capacitorjs.svg';
import coffeescript from '../app/assets/svg/skills/coffeescript.svg';
import cplusplus from '../app/assets/svg/skills/cplusplus.svg';
import csharp from '../app/assets/svg/skills/csharp.svg';
import css from '../app/assets/svg/skills/css.svg';
import dart from '../app/assets/svg/skills/dart.svg';
import deno from '../app/assets/svg/skills/deno.svg';
import django from '../app/assets/svg/skills/django.svg';
import docker from '../app/assets/svg/skills/docker.svg';
import fastify from '../app/assets/svg/skills/fastify.svg';
import figma from '../app/assets/svg/skills/figma.svg';
import firebase from '../app/assets/svg/skills/firebase.svg';
import flutter from '../app/assets/svg/skills/flutter.svg';
import gcp from '../app/assets/svg/skills/gcp.svg';
import gimp from '../app/assets/svg/skills/gimp.svg';
import git from '../app/assets/svg/skills/git.svg';
import go from '../app/assets/svg/skills/go.svg';
import graphql from '../app/assets/svg/skills/graphql.svg';
import haxe from '../app/assets/svg/skills/haxe.svg';
import html from '../app/assets/svg/skills/html.svg';
import illustrator from '../app/assets/svg/skills/illustrator.svg';
import ionic from '../app/assets/svg/skills/ionic.svg';
import java from '../app/assets/svg/skills/java.svg';
import javascript from '../app/assets/svg/skills/javascript.svg';
import julia from '../app/assets/svg/skills/julia.svg';
import kotlin from '../app/assets/svg/skills/kotlin.svg';
import lightroom from '../app/assets/svg/skills/lightroom.svg';
import markdown from '../app/assets/svg/skills/markdown.svg';
import materialui from '../app/assets/svg/skills/materialui.svg';
import matlab from '../app/assets/svg/skills/matlab.svg';
import memsql from '../app/assets/svg/skills/memsql.svg';
import microsoftoffice from '../app/assets/svg/skills/microsoftoffice.svg';
import mongoDB from '../app/assets/svg/skills/mongoDB.svg';
import mysql from '../app/assets/svg/skills/mysql.svg';
import nextJS from '../app/assets/svg/skills/nextJS.svg';
import nginx from '../app/assets/svg/skills/nginx.svg';
import numpy from '../app/assets/svg/skills/numpy.svg';
import nuxtJS from '../app/assets/svg/skills/nuxtJS.svg';
import opencv from '../app/assets/svg/skills/opencv.svg';
import photoshop from '../app/assets/svg/skills/photoshop.svg';
import php from '../app/assets/svg/skills/php.svg';
import picsart from '../app/assets/svg/skills/picsart.svg';
import postgresql from '../app/assets/svg/skills/postgresql.svg';
import premierepro from '../app/assets/svg/skills/premierepro.svg';
import prisma from '../app/assets/svg/skills/prisma.svg';
import python from '../app/assets/svg/skills/python.svg';
import pytorch from '../app/assets/svg/skills/pytorch.svg';
import react from '../app/assets/svg/skills/react.svg';
import ruby from '../app/assets/svg/skills/ruby.svg';
import selenium from '../app/assets/svg/skills/selenium.svg';
import sketch from '../app/assets/svg/skills/sketch.svg';
import strapi from '../app/assets/svg/skills/strapi.svg';
import svelte from '../app/assets/svg/skills/svelte.svg';
import swift from '../app/assets/svg/skills/swift.svg';
import tailwind from '../app/assets/svg/skills/tailwind.svg';
import tensorflow from '../app/assets/svg/skills/tensorflow.svg';
import typescript from '../app/assets/svg/skills/typescript.svg';
import unity from '../app/assets/svg/skills/unity.svg';
import vitejs from '../app/assets/svg/skills/vitejs.svg';
import vue from '../app/assets/svg/skills/vue.svg';
import vuetifyjs from '../app/assets/svg/skills/vuetifyjs.svg';
import webix from '../app/assets/svg/skills/webix.svg';
import wolframalpha from '../app/assets/svg/skills/wolframalpha.svg';
import wordpress from '../app/assets/svg/skills/wordpress.svg';

import pandas from '../app/assets/svg/skills/pandas.svg';
import scikitlearn from '../app/assets/svg/skills/scikit-learn.svg';
import dotnet from '../app/assets/svg/skills/dotnet.svg';
import dotnetcore from '../app/assets/svg/skills/dotnetcore.svg';
import kubernetes from '../app/assets/svg/skills/kubernetes.svg';
import linux from '../app/assets/svg/skills/linux.svg';
import sqlalchemy from '../app/assets/svg/skills/sqlalchemy.svg';
import fastapi from '../app/assets/svg/skills/fastapi.svg';

export const skillsImage = (skill) => {
  if (!skill || typeof skill !== 'string') {
    return null;
  }
  
  const skillID = skill.toLowerCase().trim();
  
  switch (skillID) {
    // Programming Languages
    case 'c':
      return c;
    case 'c++':
    case 'cplusplus':
      return cplusplus;
    case 'c#':
    case 'csharp':
      return csharp;
    case 'dart':
      return dart;
    case 'go':
    case 'golang':
      return go;
    case 'java':
      return java;
    case 'javascript':
    case 'js':
      return javascript;
    case 'julia':
      return julia;
    case 'kotlin':
      return kotlin;
    case 'matlab':
      return matlab;
    case 'php':
      return php;
    case 'python':
    case 'py':
      return python;
    case 'ruby':
      return ruby;
    case 'swift':
      return swift;
    case 'typescript':
    case 'ts':
      return typescript;
    case 'coffeescript':
      return coffeescript;
    case 'haxe':
      return haxe;

    // Web Technologies
    case 'html':
    case 'html5':
      return html;
    case 'css':
    case 'css3':
      return css;
    case 'angular':
      return angular;
    case 'react':
    case 'reactjs':
      return react;
    case 'vue':
    case 'vuejs':
    case 'vue.js':
      return vue;
    case 'svelte':
      return svelte;
    case 'next js':
    case 'nextjs':
    case 'next.js':
      return nextJS;
    case 'nuxt js':
    case 'nuxtjs':
    case 'nuxt.js':
      return nuxtJS;

    // CSS Frameworks
    case 'bootstrap':
      return bootstrap;
    case 'bulma':
      return bulma;
    case 'tailwind':
    case 'tailwindcss':
    case 'tailwind css':
      return tailwind;
    case 'materialui':
    case 'material ui':
    case 'material-ui':
    case 'mui':
      return materialui;
    case 'vuetifyjs':
    case 'vuetify':
      return vuetifyjs;

    // Databases & SQL
    case 'mongodb':
    case 'mongo':
      return mongoDB;
    case 'mysql':
      return mysql;
    case 'postgresql':
    case 'postgres':
      return postgresql;
    case 'memsql':
      return memsql;
    case 'sql':
    case 'structured query language':
      return mysql; // Using MySQL as generic SQL icon
    case 'sqlalchemy':
    case 'sql alchemy':
      return sqlalchemy;
    case 'dbms':
    case 'database management':
    case 'database management systems':
      return postgresql; // Using PostgreSQL as generic DBMS icon

    // Cloud & DevOps
    case 'aws':
    case 'amazon web services':
      return aws;
    case 'azure':
    case 'microsoft azure':
      return azure;
    case 'gcp':
    case 'google cloud':
    case 'google cloud platform':
      return gcp;
    case 'docker':
      return docker;
    case 'kubernetes':
    case 'k8s':
      return kubernetes;
    case 'nginx':
      return nginx;

    // Backend Frameworks & APIs
    case 'django':
      return django;
    case 'fastify':
      return fastify;
    case 'fastapi':
    case 'fast api':
      return fastapi;
    case 'flask':
      return python; // Flask uses Python icon
    case 'strapi':
      return strapi;
    case '.net':
    case 'dotnet':
      return dotnet;
    case '.net core':
    case 'dotnet core':
    case 'dotnetcore':
      return dotnetcore;
    case 'node js':
    case 'nodejs':
    case 'node.js':
      return javascript; // Node.js uses JavaScript icon
    case 'express':
    case 'express.js':
    case 'expressjs':
      return javascript; // Express uses JavaScript icon
    case 'spring boot':
    case 'springboot':
    case 'spring':
      return java; // Spring Boot uses Java icon
    case 'rest apis':
    case 'rest api':
    case 'restapi':
    case 'rest':
      return graphql; // Using GraphQL as generic API icon
    case 'graphql':
    case 'graph ql':
      return graphql;

    // Mobile Development
    case 'flutter':
      return flutter;
    case 'ionic':
      return ionic;
    case 'capacitorjs':
    case 'capacitor':
      return capacitorjs;

    // Tools & Version Control
    case 'git':
      return git;
    case 'github':
      return git; // GitHub uses Git icon
    case 'vs code':
    case 'vscode':
    case 'visual studio code':
      return typescript; // VS Code uses TypeScript icon (since it's built with TS)
    case 'linux':
      return linux;
    case 'operating systems':
    case 'os':
      return linux; // Using Linux as generic OS icon
    case 'firebase':
      return firebase;
    case 'prisma':
      return prisma;
    case 'deno':
      return deno;
    case 'vitejs':
    case 'vite':
      return vitejs;
    case 'selenium':
      return selenium;
    case 'unity':
      return unity;
    case 'webix':
      return webix;
    case 'wordpress':
      return wordpress;
    case 'markdown':
      return markdown;

    // Data Science & ML
    case 'numpy':
      return numpy;
    case 'pandas':
      return pandas;
    case 'sklearn':
    case 'scikit-learn':
    case 'scikit learn':
      return scikitlearn;
    case 'pytorch':
    case 'torch':
      return pytorch;
    case 'tensorflow':
    case 'tf':
      return tensorflow;
    case 'keras':
      return tensorflow; // Keras is now part of TensorFlow
    case 'opencv':
    case 'cv2':
      return opencv;
    case 'langchain':
      return python; // LangChain uses Python icon
    case 'openai api':
    case 'openai':
      return python; // OpenAI API typically used with Python
    case 'reinforcement learning':
    case 'rl':
      return pytorch; // RL commonly uses PyTorch
    case 'deep q-learning':
    case 'dqn':
    case 'deep q learning':
      return pytorch; // DQN uses PyTorch
    case 'machine learning':
    case 'ml':
      return tensorflow; // Generic ML icon
    case 'artificial intelligence':
    case 'ai':
      return tensorflow; // Generic AI icon

    // Specialized Tools & Simulation
    case 'sumo':
    case 'traci':
      return python; // Traffic simulation tools typically use Python
    case 'tableau':
      return microsoftoffice; // Using Office as generic data visualization
    case 'power bi':
    case 'powerbi':
      return microsoftoffice; // Power BI is Microsoft product

    // Programming Concepts
    case 'oops':
    case 'oop':
    case 'object oriented programming':
    case 'object-oriented programming':
      return java; // Java is strongly associated with OOP
    case 'sdlc':
    case 'software development life cycle':
    case 'software development lifecycle':
      return git; // Using Git as generic development process icon

    // Design Tools
    case 'photoshop':
    case 'adobe photoshop':
      return photoshop;
    case 'illustrator':
    case 'adobe illustrator':
      return illustrator;
    case 'adobe xd':
    case 'xd':
      return adobeXd;
    case 'after effects':
    case 'adobe after effects':
    case 'aftereffects':
      return afterEffects;
    case 'premiere pro':
    case 'adobe premiere pro':
    case 'premierepro':
      return premierepro;
    case 'adobe audition':
    case 'audition':
      return adobeaudition;
    case 'lightroom':
    case 'adobe lightroom':
      return lightroom;
    case 'figma':
      return figma;
    case 'sketch':
      return sketch;
    case 'canva':
      return canva;
    case 'picsart':
      return picsart;
    case 'gimp':
      return gimp;
    case 'blender':
      return blender;

    // Office & Productivity
    case 'microsoft office':
    case 'ms office':
    case 'office':
      return microsoftoffice;
    case 'wolframalpha':
    case 'wolfram alpha':
    case 'wolfram':
      return wolframalpha;

    default:
      // Only log warnings in development mode to reduce console noise
      if (process.env.NODE_ENV === 'development') {
        console.warn(`No image found for skill: ${skill}`);
      }
      return null; // Return null for unmapped skills
  }
};