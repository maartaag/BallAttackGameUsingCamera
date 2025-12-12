# 🎮 Ball Attack amb Handpose

## ✨ Explicación de la interfaz alternativa
Esta versión del juego **Ball Attack** sustituye los botones tradicionales por una interfaz basada en la cámara y la detección de manos.  
El jugador ve su propia imagen en la pantalla y tres cajas en la parte superior: **rojo (izquierda)**, **azul (centro)** y **verde (derecha)**.  
Al colocar la mano en una de estas zonas, el sistema interpreta el gesto como un disparo del color correspondiente.

## 🖐️ Input elegido y por qué
El input elegido es **la posición espacial de la mano detectada con Handpose (ml5.js)**.  
- Se utiliza la punta del dedo índice como referencia.  
- Se ha elegido este input porque permite una experiencia más **interactiva y natural**, sin necesidad de botones físicos ni teclado.  
- El efecto espejo en la cámara asegura que lo que el jugador ve coincide con la detección (mano derecha → zona derecha).

## 🎲 Cómo se usa para jugar
1. Pulsa el botón **Start** para comenzar la partida.  
2. Observa las bolas que caen por el camino sinuoso.  
3. Coloca tu mano en la zona de color correcta (izquierda, centro o derecha) para disparar contra la primera bola:  
   - **Izquierda → Rojo**  
   - **Centro → Azul**  
   - **Derecha → Verde**  
4. Si aciertas, la bola desaparece y sumas puntos. Si fallas, pierdes puntuación.  
5. Puedes pausar la partida con el botón **Pause** y reanudarla cuando quieras.  
6. El juego termina cuando una bola llega al final del recorrido (**Game Over**).

## 📸 Capturas opcionales
<img width="1085" height="898" alt="image" src="https://github.com/user-attachments/assets/fc01df4d-7c32-4040-920f-c4e29c3c5726" />


## 📚 Créditos de librerías externas
- [p5.js](https://p5js.org/) → Librería principal para gráficos y canvas.  
- [ml5.js](https://ml5js.org/) → Librería de machine learning en JavaScript, usada para la detección de manos con **Handpose**.  
- [p5.dom](https://github.com/processing/p5.js/wiki/p5.js,-p5.dom,-and-p5.sound) → Extensión de p5.js para manipulación de elementos DOM (botones, divs, etc.).

---
