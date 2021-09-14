const displayStyle = {
	width: 280,
	inputFontSize: 24,
	initialInputFontSize: 24,
	outputFontSize: 28,
	initialOutputFontSize: 28,
};

const calcApp = new Vue({
	el: "#calc-app",
	data: {
		expression: "0",
		output: "0",
		displayStyle: displayStyle,
	},
	methods: {
		// 入力されたオペランドを数式に追加する
		addOperand: function (input) {
			if (this.expression === "0") this.expression = input;
			else this.expression += input;

			this.adjustInputFontSize();
		},

		// 入力された小数点を数式に追加する
		addDecimalPoint: function (input) {
			let i = this.expression.length - 1;

			if (this.expression.charAt(i) === " ") return this.expression;

			while (this.expression.charAt(i) !== " " && this.expression.charAt(i) !== "." && i > 0) {
				i--;
			}

			if (this.expression.charAt(i) === " " || i <= 0) this.expression += input;

			this.adjustInputFontSize();
		},

		// 入力されたオペレータを数式に追加する
		addOperator: function (input) {
			let lastIndex = this.expression.length - 1;

			if (this.expression !== "0") {
				if (this.expression.charAt(lastIndex) === ".") this.expression = this.expression.substring(0, lastIndex) + " " + input + " ";
				else if (this.expression.charAt(lastIndex) === " ") this.expression = this.expression.substring(0, lastIndex - 1) + input + " ";
				else this.expression += " " + input + " ";
			}

			this.adjustInputFontSize();
		},

		// 数式をクリアする
		clearExpression: function () {
			this.expression = "0";
			this.displayStyle.inputFontSize = this.displayStyle.initialInputFontSize;
		},

		// 数式から1文字削除する
		deleteToken: function () {
			let lastIndex = this.expression.length - 1;

			if (this.expression.charAt(lastIndex) === " ") this.expression = this.expression.substring(0, lastIndex - 2);
			else this.expression = this.expression.substring(0, lastIndex);

			this.adjustInputFontSize();
		},

		// オペレータの優先順位を返す
		getPriority: function (operator) {
			if (operator == "+" || operator == "-") return 1;
			else if (operator == "×" || operator == "/" || operator == "%") return 2;
		},

		// 四則演算をする
		process: function (stack, operator) {
			const right = Number(stack.pop());
			const left = Number(stack.pop());

			let value = 0;

			switch (operator) {
				case "+": value = left + right; break;
				case "-": value = left - right; break;
				case "×": value = left * right; break;
				case "/": value = left / right; break;
				case "%": value = left % right; break;
			}

			stack.push(value.toFixed(5));
		},

		// トークンがオペレータならtrueを返す
		isOperator: function (token) {
			return token === "+" || token === "-" || token === "×" || token === "/" || token === "%";
		},

		// オペレータの優先順位に従って計算し、答えをthis.outputにセットする
		getResult: function () {
			let expressList = this.expression.split(" ");
			let numStack = [];
			let opStack = [];

			this.displayStyle.outputFontSize = this.displayStyle.initialOutputFontSize;

			for (let i = 0; i < expressList.length; i++) {
				if (this.isOperator(expressList[i])) {
					let currOp = expressList[i];

					while (opStack.length > 0 && this.getPriority(currOp) <= this.getPriority(opStack[opStack.length - 1])) {
						this.process(numStack, opStack[opStack.length - 1]);
						opStack.pop();
					}
					opStack.push(currOp);

				} else {
					numStack.push(expressList[i]);
				}
			}

			while (opStack.length > 0) {
				this.process(numStack, opStack[opStack.length - 1]);
				opStack.pop();
			}

			let output = numStack[0];
			let lastIndex = output.length - 1;

			while (output.charAt(lastIndex) === "0" && output.charAt(lastIndex) !== ".") {
				lastIndex--;
			}

			if (output.charAt(lastIndex) === ".") lastIndex--;

			this.output = output.substring(0, lastIndex + 1);
			this.adjustOutputFontSize();
		},

		// 数式がディスプレイからはみ出ているかどうか判定する
		isDisplaySizeFull: function () {
			const targetWidth = document.getElementById("expression").offsetWidth;
			const displayWidth = this.displayStyle.width - 60;
			return targetWidth > displayWidth;
		},

		// 入力した数式がディスプレイに収まるように文字サイズを調整する
		adjustInputFontSize: function () {
			if (this.isDisplaySizeFull() && this.displayStyle.inputFontSize > 5) this.displayStyle.inputFontSize--;
			else if (this.displayStyle.inputFontSize < this.displayStyle.initialInputFontSize) this.displayStyle.inputFontSize++;
		},

		// 計算結果がディスプレイに収まるように文字サイズを調整する
		adjustOutputFontSize: function () {
			if (this.output.length > 17) this.displayStyle.outputFontSize = this.displayStyle.outputFontSize - (this.output.length - 17) * 2;
		}
	}
})