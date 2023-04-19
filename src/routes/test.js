const DEFAULT_STATES = [
  {
    name: "emailAddress",
    useValidator: true,
  },
  {
    name: "productCategory",
    show: true,
  },
  {
    name: "purchaseDate",
    show: true,
  },
  {
    name: "callDisposition",
    show: false,
  },
  {
    name: "callResult",
    show: true,
  },
  {
    name: "question2",
    show: false,
  },
  {
    name: "application",
    show: false,
  },
  {
    name: "productRelevance",
    show: false,
  },
  {
    name: "comments",
    value: "",
  },
  {
    name: "budgetRange",
    value: "",
    show: false,
  },
  {
    name: "followupTime",
    value: "",
    show: false,
  },
  {
    name: "callDisposition",
    show: false,
    value: "",
  },

  // Blocks that don't have html "name" attribute
  {
    contentFragment: "T9.",
    show: false,
    // onClick: "SCROLL_TO_TOP",
    onClick: scrollToElement({ name: "emailAddress" }),
  },
  {
    contentFragment: "T7.",
    show: false,
  },
  {
    contentFragment: "T12.",
    show: true,
  },
  {
    contentFragment: "T10.",
    show: false
  },

  {
    contentFragment: "T8.",
    show: false
  },
  {
    name: 'dropdownMenu2',
    show: false
  },
  {
    contentFragment: "T11.",
    show: false
  },
];

/**
 * All rules
 *
 * if all elements from `if` array have specified values
 * then all elements from `then` array will be adjusted to specified values
 */
const RULES = [
  {
    if: [{ name: "lead", value: "Information" }],
    then: [
      // {
      //   name: "productCategory",
      //   show: true,
      // },
    ],
  },
  {
    if: [
      {
        name: "lead",
        value: "Quote",
      }
    ],
    then: [
      {
        name: "inquiryType",
        value: "Quote",
      },
      {
        name: "question2",
        show: true,
      },
      {
        name: "purchaseDate",
        show: false,
      },
      {
        name: "productRelevance",
        show: true,
      },
	  {
        name: "productCategory",
        show: true,
      },
	  {
        name: "application",
        show: true,
      },
	  {
        name: "budgetRange",
        show: true,
      },
	  {
        name: "followupTime",
        show: true,
      },
      {
        name: "wgAmt",
        value: "WG",
      },
      {
        contentFragment: "T7.",
        show: true,
      },
	  {
        contentFragment: "T8.",
        show: true,
      },
	  {
        contentFragment: "T10.",
        show: true,
      },
	  {
        contentFragment: "T12.",
        show: false,
      },
	  {
        contentFragment: "T11.",
        show: true,
      },
	],
  },
  {
    if: [
      {
        name: "lead",
        value: "Information",
      },
    ],
    then: [
      {
        name: "inquiryType",
        value: "Information",
      },
      {
        name: "productCategory",
        show: true,
      },
      {
        name: "productRelevance",
        show: true,
      },
	  {
        name: "purchaseDate",
        show: false,
      },
	  {
        name: "followupTime",
        show: true,
      },
	  {
        contentFragment: "T12.",
        show: false,
      },
	  {
        contentFragment: "T8.",
        show: true,
      },
	  {
        name: "wgAmt",
        value: "",
      },
    ],
  },
  {
    if: [
      {
        name: "lead",
        value: "No interest",
      },
    ],
    then: [
      {
        name: "inquiryType",
        value: "No interest",
      },
	  {
        name: "productRelevance",
        show: true,
      },
	  {
        contentFragment: "T12.",
        show: false,
      },
	  {
        contentFragment: "T11.",
        show: false,
      },
	  {
        contentFragment: "T18.",
        show: false,
      },
      {
        name: "wgAmt",
        value: "",
      },
      {
        name: "callResult",
        show: true,
        disabled: false,
      },
    ],
  },

  {
    if: [
      {
        name: "callResult",
        value: "MQL",
      },
    ],
    then: [
      {
        name: "comments",
        value:
          "The lead was generated from telemarketing campaign. Customer expressed buying intent for product below. Please contact customer and follow up",
      },
      {
        name: "callDisposition",
        show: false,
        value: "TQ_Qualified",
      },
    ],
  },
  {
    if: [
      {
        name: "lead",
        value: "Quote",
      },
    ],
    then: [
      {
        name: "callResult",
        value: "MQL",
        disabled: false,
        show: true,
      },
    ],
  },
  {
    if: [
      {
        name: "lead",
        value: "Information",
      },
    ],
    then: [
      {
        name: "callResult",
        value: "Information",
        disabled: false,
        show: true,
      },
    ],
  },

  {
    if: [
      {
        name: "lead",
        value: "No interest",
      },
    ],
    then: [
      {
        name: "callResult",
        show: true,
        disabled: false,
        value: "",
      },
      {
        name: 'dropdownMenu2',
        show: true,
      },
      {
        name: 'productCategory',
        show: true,
      },
      {
        contentFragment: "T11.",
        show: true,
      },
    ],
  },

  {
    if: [
      {
        name: "lead",
        value: "No interest",
      },
    ],
    then: [
      {
        name: "callResult",
        show: true,
      },
    ],
  },
	
  {
    if: [
      {
        name: "lead",
        value: "Information",
      },
    ],
    then: [
      {
        contentFragment: "T9.",
        show: true,
      },
    ],
  },

  {
    if: [
      {
        name: "lead",
        value: "Quote",
      },
    ],
    then: [
      {
        contentFragment: "T9.",
        show: true,
      },
    ],
  },
  {
    if: [
      {
        name: "doNotCallFlag",
        checked: true,
      },
    ],
    then: [
      {
        name: "callResult",
        value: "Hung up / Do not call again",
        show: true,
        disabled: false,
      },
    ],
  },

  {
    if: [
      {
        name: "callResult",
        value: "Invalid Number",
      },
    ],
    then: [
      {
        name: "callDisposition",
        show: false,
        value: "TQ_Disqualified",
      },
    ],
  },
  {
    if: [
      {
        name: "callResult",
        value: "Wrong Number",
      },
    ],
    then: [
      {
        name: "callDisposition",
        show: false,
        value: "TQ_Disqualified",
      },
    ],
  },
  {
    if: [
      {
        name: "callResult",
        value: "No Answer",
      },
    ],
    then: [
      {
        name: "callDisposition",
        show: false,
        value: "TQ_NoContact",
      },
    ],
  },
  {
    if: [
      {
        name: "callResult",
        value: "Voicemail",
      },
    ],
    then: [
      {
        name: "callDisposition",
        show: false,
        value: "TQ_LeftMessage",
      },
    ],
  },
  {
    if: [
      {
        name: "callResult",
        value: "Hung up / Do not call again",
      },
    ],
    then: [
      {
        name: "callDisposition",
        show: false,
        value: "TQ_Disqualified",
      },
    ],
  },
  {
    if: [
      {
        name: "callResult",
        value: "Person has left company",
      },
    ],
    then: [
      {
        name: "callDisposition",
        show: false,
        value: "TQ_Disqualified",
      },
    ],
  },
  {
    if: [
      {
        name: "callResult",
        value: "Call completed, products not relevant",
      },
    ],
    then: [
      {
        name: "callDisposition",
        show: true,
        value: "TQ_Disqualified",
      },
    ],
  },
  {
    if: [
      {
        name: "callResult",
        value: "Information",
      },
    ],
    then: [
      {
        name: "callDisposition",
        show: false,
        value: "TQ_Qualified",
      },
    ],
  },
  {
    if: [
      {
        name: "callResult",
        value: "Call completed, products relevant",
      },
    ],
    then: [
      {
        name: "callDisposition",
        show: false,
        value: "TQ_Qualified",
      },
    ],
  },
  {
    if: [
      {
        name: "callResult",
        value: "Call completed, products relevant, request call back",
      },
    ],
    then: [
      {
        name: "callDisposition",
        show: false,
        value: "TQ_LeftMessage",
      },
    ],
  }
];

const ELQ_PARENT_CLASS = "elq-field-style";

const getElementsFromRule = (rule) => {
  if (rule.contentFragment) {
    return [getElementByInnerWord(rule.contentFragment)];
  }

  if (rule.formElementId) {
    return [document.getElementById(`formElement${rule.formElementId}`)];
  }

  return Array.from(document.getElementsByName(rule.name));
};

const makeDefaultStates = () => {
  DEFAULT_STATES.forEach((defaultState) => {
    const elements = getElementsFromRule(defaultState);

    elements.forEach((elm) => {
      if (typeof defaultState.onClick !== "undefined") {
        if (typeof defaultState.onClick === "function") {
          elm.onclick = defaultState.onClick;
        } else {
          switch (defaultState.onClick) {
            case "SCROLL_TO_TOP":
              elm.onclick = () => {
                scroll(0, 0);
              };
              break;
            default:
              elm.onclick = () => {
                console.log(
                  `On click ${defaultState.onClick} not recognized - element: `,
                  elm
                );
              };
              break;
          }
        }
      }

      if (typeof defaultState.show !== "undefined") {
        if (defaultState.show) {
          showQuestionParent(elm);
        } else {
          hideQuestionParent(elm);
        }
      }

      if (typeof defaultState.disabled !== "undefined") {
        if (defaultState.disabled) {
          elm.disabled = true;
        } else {
          elm.disabled = false;
        }
      }

      if (typeof defaultState.value !== "undefined") {
        if (typeof elm.checked !== "undefined") {
          if (defaultState.value === elm.value) {
            elm.checked = true;
          }
        } else {
          elm.value = defaultState.value;
        }
      }

      if (typeof defaultState.checked !== "undefined") {
        if (defaultState.checked) {
          elm.checked = true;
        } else {
          elm.checked = false;
        }
      }
    });
  });
};

function scrollToElement(elementToFind) {
  return () => {
    const elements = getElementsFromRule(elementToFind);
    elements[0].scrollIntoView();
  };
}

const initForm = async () => {
  const mainRuleChecker = (elementThatFiredEvent) => {
    makeDefaultStates();
    RULES.forEach((rule) => {
      // console.log("Main rule checker");

      const isRuleFulfilled = rule.if.every((ifRule) => {
        const elementsList = getElementsFromRule(ifRule);

        return elementsList.find((elm) => {
          if (typeof ifRule.checked !== "undefined") {
            return elm.checked === ifRule.checked;
          }

          if (typeof elm.checked !== "undefined") {
            return elm.value === ifRule.value && elm.checked;
          }
          return elm.value === ifRule.value;
        });
      });

      if (isRuleFulfilled) {
        rule.then.forEach((thenRule) => {
          const elementsList = getElementsFromRule(thenRule);

          elementsList.forEach((elm) => {
            if (elementThatFiredEvent !== elm) {
              if (thenRule.value) {
                elm.value = thenRule.value;
              }

              if (typeof thenRule.disabled !== "undefined") {
                if (thenRule.disabled) {
                  elm.disabled = true;
                } else {
                  elm.disabled = false;
                }
              }

              // console.log('THEN RULE', thenRule)
              switch (thenRule.show) {
                case true:
                  showQuestionParent(elm);
                  break;
                case false:
                  hideQuestionParent(elm);
                  break;
                default:
                  showQuestionParent(elm);
                  break;
              }
            } else {
              // Element fired manually
              showQuestionParent(elementThatFiredEvent);
            }
          });
        });
      }
    });
  };

  mainRuleChecker();

  RULES.forEach((rule) => {
    rule.if.forEach((ifRule) => {
      const elements = Array.from(document.getElementsByName(ifRule.name));

      elements.forEach((elm) => {
        elm.oninput = (e) => {
          mainRuleChecker(e.target);
          mainRuleChecker(e.target);
        };
      });
    });
  });
};

const showQuestionParent = (htmlElement) => {
  const element = htmlElement.closest(`.${ELQ_PARENT_CLASS}`);
  // console.log('SHOW', htmlElement)
  // console.log('SHOW -> THIS', element)
  if (!element) {
    htmlElement.style.display = "block";
  } else {
    element.style.display = "block";
  }
};

const hideQuestionParent = (htmlElement) => {
  const element = htmlElement.closest(`.${ELQ_PARENT_CLASS}`);
  // console.log('HIDE -> THIS', element)

  if (!element) {
    htmlElement.style.display = "none";
  } else {
    element.style.display = "none";
  }
};

const testRule = (rule, elementValue) => {
  switch (rule) {
    case CONSTANTS.NOT_EMPTY:
      return elementValue !== "";
    case CONSTANTS.EMPTY:
      return elementValue === "" || !elementValue;
    default:
      return rule === elementValue;
  }
};

function createValidator(labelQuery, elementQuery) {
  const element = document.querySelector(labelQuery);
  const span = document.createElement("span");
  span.classList.add("elq-required");
  span.textContent = "*";
  element.appendChild(span);
  // $(labelQuery).append('<span class="elq-required">*</span>');

  var validator = new LiveValidation(document.querySelector(elementQuery), {
    validMessage: "",
    onlyOnBlur: false,
    wait: 300,
  });

  var validationParam = {
    failureMessage: "This field is required",
  };

  function addValidation() {
    validator.add(Validate.Presence, validationParam);
  }

  function removeValidation() {
    validator.remove(Validate.Presence, validationParam);
  }

  return {
    add: addValidation,
    remove: removeValidation,
  };
}

function getURLParameter(name) {
  var x =
    decodeURIComponent(
      (new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(
        location.search
      ) || [, ""])[1].replace(/\+/g, "%20")
    ) || null;
  return x != null ? x : "";
}

async function setValuesFromUrl() {
  // await waitForElm('input[name=hiddenCampaignID]')

  document.getElementsByName("hiddenCampaignID")[0].value =
    getURLParameter('utm_campaign');

  document.getElementsByName("hiddenDocumentID")[0].value =
    getURLParameter('utm_content');

  document.getElementsByName("hiddenSourceID")[0].value = getURLParameter('utm_source');

  document.getElementsByName("hiddenLanguageID")[0].value =
    getURLParameter("l");
}

function setDate() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();

  today = mm + "/" + dd + "/" + yyyy;

  document.getElementsByName("hiddenDialAt")[0].value = today;
}

function getElementByInnerWord(word) {
  elems = [...document.getElementsByTagName("div")];
  return elems.findLast((elem) => {
    if (elem.outerHTML.includes(word)) {
      return elem;
    }
  });
}

document.addEventListener("DOMContentLoaded", function (event) {
  // console.log("DOM fully loaded and parsed");
  initForm();
});